"""Server locale Watchverse.

Oltre ai file statici espone due piccoli endpoint senza chiavi API:
- /api/trailer: individua un trailer pubblico pertinente su YouTube;
- /api/cinema: legge la programmazione dalle pagine ufficiali delle sale configurate.

Gli endpoint accettano solo fonti predefinite e non funzionano da proxy generico.
"""
from __future__ import annotations

import html
import http.server
import json
import os
import re
import socketserver
import threading
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from datetime import date, datetime
from html.parser import HTMLParser
from typing import Any, Iterable

PORT = 8765
ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
)
CACHE_TTL = 15 * 60
_CACHE: dict[str, tuple[float, Any]] = {}

CINEMAS = {
    "the-space-surbo": {
        "name": "The Space Cinema Surbo",
        "officialUrl": "https://www.thespacecinema.it/cinema/surbo/al-cinema",
        "filmUrl": "https://www.thespacecinema.it/cinema/surbo/film/{slug}",
        "parser": "the-space",
    },
    "the-space-casamassima": {
        "name": "The Space Cinema Casamassima",
        "officialUrl": "https://www.thespacecinema.it/cinema/casamassima/al-cinema",
        "filmUrl": "https://www.thespacecinema.it/cinema/casamassima/film/{slug}",
        "parser": "the-space",
    },
    "cinema-massimo-lecce": {
        "name": "Multisala Massimo Lecce",
        "officialUrl": "https://www.multisalamassimo.it/",
        "parser": "massimo",
    },
    "db-dessai-lecce": {
        "name": "Cinema DB d’Essai",
        "officialUrl": "https://www.cinemadbdessai.it/",
        "parser": "generic",
    },
}

ITALIAN_MONTHS = {
    "gen": 1, "gennaio": 1, "feb": 2, "febbraio": 2, "mar": 3, "marzo": 3,
    "apr": 4, "aprile": 4, "mag": 5, "maggio": 5, "giu": 6, "giugno": 6,
    "lug": 7, "luglio": 7, "ago": 8, "agosto": 8, "set": 9, "sett": 9,
    "settembre": 9, "ott": 10, "ottobre": 10, "nov": 11, "novembre": 11,
    "dic": 12, "dicembre": 12,
}


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFD", value or "")
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", normalize(value)).strip("-")


def cached(key: str, loader):
    hit = _CACHE.get(key)
    now = time.time()
    if hit and now - hit[0] < CACHE_TTL:
        return hit[1]
    value = loader()
    _CACHE[key] = (now, value)
    return value


def fetch_text(url: str, timeout: int = 16) -> str:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept-Language": "it-IT,it;q=0.9,en;q=0.6",
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, "replace")


class TextExtractor(HTMLParser):
    BLOCKS = {
        "article", "br", "div", "figcaption", "footer", "h1", "h2", "h3", "h4",
        "h5", "header", "li", "main", "p", "section", "time", "tr", "td", "ul",
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.lines: list[str] = []
        self.current: list[str] = []
        self.skip = 0

    def flush(self) -> None:
        text = re.sub(r"\s+", " ", " ".join(self.current)).strip()
        if text and (not self.lines or self.lines[-1] != text):
            self.lines.append(text)
        self.current = []

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in {"script", "style", "svg", "noscript"}:
            self.skip += 1
            return
        if not self.skip and tag in self.BLOCKS:
            self.flush()

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "svg", "noscript"} and self.skip:
            self.skip -= 1
            return
        if not self.skip and tag in self.BLOCKS:
            self.flush()

    def handle_data(self, data: str) -> None:
        if not self.skip:
            value = html.unescape(data).strip()
            if value:
                self.current.append(value)

    def close(self) -> None:
        super().close()
        self.flush()


def visible_lines(document: str) -> list[str]:
    parser = TextExtractor()
    parser.feed(document)
    parser.close()
    return parser.lines


def significant_title_tokens(title: str) -> list[str]:
    ignored = {"il", "lo", "la", "i", "gli", "le", "un", "una", "the", "a", "and", "e", "di", "del", "della"}
    return [token for token in normalize(title).split() if token not in ignored and len(token) > 1]


def title_matches(line: str, title: str) -> bool:
    candidate = normalize(line)
    wanted = normalize(title)
    if not candidate or not wanted:
        return False
    if wanted in candidate or candidate in wanted:
        return True
    tokens = significant_title_tokens(title)
    return bool(tokens) and sum(token in candidate for token in tokens) >= max(1, min(2, len(tokens)))


def parse_date_label(line: str) -> tuple[str | None, str | None]:
    lowered = normalize(line)
    match = re.search(
        r"(?:lunedi|martedi|mercoledi|giovedi|venerdi|sabato|domenica)?\s*,?\s*(\d{1,2})\s+"
        r"(gen(?:naio)?|feb(?:braio)?|mar(?:zo)?|apr(?:ile)?|mag(?:gio)?|giu(?:gno)?|"
        r"lug(?:lio)?|ago(?:sto)?|set(?:t(?:embre)?)?|ott(?:obre)?|nov(?:embre)?|dic(?:embre)?)",
        lowered,
    )
    if not match:
        return None, None
    day = int(match.group(1))
    month = ITALIAN_MONTHS.get(match.group(2))
    if not month:
        return None, None
    today = date.today()
    year = today.year
    candidate = date(year, month, day)
    if (candidate - today).days < -120:
        candidate = date(year + 1, month, day)
    return candidate.isoformat(), line.strip()


def extract_times(text: str) -> list[str]:
    times: list[str] = []
    for hour, minute in re.findall(r"(?<!\d)([0-2]?\d)[\.:]([0-5]\d)(?!\d)", text):
        h = int(hour)
        if h > 23:
            continue
        value = f"{h:02d}:{minute}"
        if value not in times:
            times.append(value)
    return times


def parse_title_window(lines: list[str], title: str, window: int = 55) -> list[str]:
    matches = [index for index, line in enumerate(lines) if title_matches(line, title)]
    if not matches:
        return []
    # Prefer the occurrence followed by time-like content.
    best = matches[0]
    best_score = -1
    for index in matches[:10]:
        candidate = lines[index:index + window]
        score = sum(len(extract_times(line)) for line in candidate)
        if score > best_score:
            best, best_score = index, score
    return lines[best:best + window]


def make_showtimes(lines: list[str], official_url: str, source: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    current_date: str | None = None
    current_label: str | None = None
    stop_words = ("durata", "trama", "cast", "prossimamente", "newsletter", "informazioni sul film")
    for line in lines:
        normalized = normalize(line)
        parsed_date, parsed_label = parse_date_label(line)
        if parsed_date:
            current_date, current_label = parsed_date, parsed_label
        if any(word in normalized for word in stop_words) and rows:
            break
        if "durata" in normalized:
            continue
        for value in extract_times(line):
            key = (current_date or "", value)
            if any((row.get("dateKey") or "", row.get("time")) == key for row in rows):
                continue
            rows.append(
                {
                    "time": value,
                    "dateKey": current_date,
                    "dateLabel": current_label or "Programmazione corrente",
                    "bookingUrl": official_url,
                    "source": source,
                }
            )
    return rows[:24]


def parse_cinema(cinema_id: str, title: str) -> dict[str, Any]:
    cinema = CINEMAS[cinema_id]
    source_url = cinema.get("filmUrl", "").format(slug=slugify(title)) or cinema["officialUrl"]
    errors: list[str] = []
    documents: list[tuple[str, str]] = []
    for url in [source_url, cinema["officialUrl"]]:
        if any(existing_url == url for existing_url, _ in documents):
            continue
        try:
            body = cached(f"html:{url}", lambda url=url: fetch_text(url))
            documents.append((url, body))
        except (urllib.error.URLError, TimeoutError, OSError) as error:
            errors.append(str(error))
    showtimes: list[dict[str, Any]] = []
    used_url = cinema["officialUrl"]
    for url, body in documents:
        lines = visible_lines(body)
        window = parse_title_window(lines, title, 70)
        if not window and cinema["parser"] == "the-space" and title_matches(" ".join(lines[:25]), title):
            window = lines[:90]
        candidate = make_showtimes(window, url, f"Sito ufficiale · {cinema['name']}")
        if candidate:
            showtimes = candidate
            used_url = url
            break
    return {
        "cinemaId": cinema_id,
        "cinemaName": cinema["name"],
        "officialUrl": cinema["officialUrl"],
        "sourceUrl": used_url,
        "showtimes": showtimes,
        "available": bool(showtimes),
        "error": "; ".join(errors[:2]) if not documents else None,
    }


def youtube_initial_data(document: str) -> dict[str, Any] | None:
    markers = ("var ytInitialData = ", "ytInitialData = ", 'window["ytInitialData"] = ')
    for marker in markers:
        start = document.find(marker)
        if start < 0:
            continue
        start = document.find("{", start + len(marker))
        if start < 0:
            continue
        depth = 0
        in_string = False
        escaped = False
        for index in range(start, min(len(document), start + 8_000_000)):
            char = document[index]
            if in_string:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == '"':
                    in_string = False
                continue
            if char == '"':
                in_string = True
            elif char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(document[start:index + 1])
                    except json.JSONDecodeError:
                        break
    return None


def walk_video_renderers(value: Any) -> Iterable[dict[str, Any]]:
    if isinstance(value, dict):
        renderer = value.get("videoRenderer")
        if isinstance(renderer, dict):
            yield renderer
        for child in value.values():
            yield from walk_video_renderers(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_video_renderers(child)


def runs_text(value: Any) -> str:
    if not isinstance(value, dict):
        return ""
    if "simpleText" in value:
        return str(value.get("simpleText") or "")
    return "".join(str(run.get("text") or "") for run in value.get("runs") or [] if isinstance(run, dict))


def trailer_score(title: str, year: str, video_title: str, channel: str) -> int:
    wanted = significant_title_tokens(title)
    haystack = normalize(f"{video_title} {channel}")
    score = sum(18 for token in wanted if token in haystack)
    normalized_video = normalize(video_title)
    if "trailer ufficiale" in normalized_video or "official trailer" in normalized_video:
        score += 70
    elif "trailer" in normalized_video:
        score += 38
    if "teaser ufficiale" in normalized_video or "official teaser" in normalized_video:
        score += 42
    if year and str(year) in video_title:
        score += 8
    if any(word in haystack for word in ("warner bros", "netflix", "disney", "hbo", "max", "paramount", "universal", "sony pictures", "lionsgate", "prime video", "apple tv", "sky", "rai", "medusa film", "01 distribution", "eagle pictures", "20th century")):
        score += 24
    if any(word in haystack for word in ("fan trailer", "concept trailer", "reaction", "recensione", "analisi", "ending", "soundtrack", "clip ita")):
        score -= 90
    return score


def find_public_trailer(title: str, year: str = "", kind: str = "") -> dict[str, Any] | None:
    queries = [
        f'{title} {year} trailer ufficiale'.strip(),
        f'{title} {year} official trailer'.strip(),
    ]
    candidates: dict[str, dict[str, Any]] = {}
    for query in queries:
        url = "https://www.youtube.com/results?" + urllib.parse.urlencode({"search_query": query})
        try:
            document = cached(f"youtube:{query}", lambda url=url: fetch_text(url))
        except (urllib.error.URLError, TimeoutError, OSError):
            continue
        data = youtube_initial_data(document)
        if data:
            for renderer in walk_video_renderers(data):
                video_id = str(renderer.get("videoId") or "")
                if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
                    continue
                video_title = runs_text(renderer.get("title"))
                channel = runs_text(renderer.get("ownerText")) or runs_text(renderer.get("longBylineText"))
                score = trailer_score(title, year, video_title, channel)
                if score < 60:
                    continue
                current = candidates.get(video_id)
                if not current or score > current["score"]:
                    candidates[video_id] = {
                        "site": "YouTube",
                        "key": video_id,
                        "url": f"https://www.youtube.com/watch?v={video_id}",
                        "name": video_title or "Trailer ufficiale",
                        "channel": channel,
                        "official": score >= 95,
                        "source": "Ricerca pubblica YouTube",
                        "score": score,
                    }
        if not data:
            for video_id in re.findall(r'"videoId":"([A-Za-z0-9_-]{11})"', document)[:20]:
                candidates.setdefault(video_id, {
                    "site": "YouTube", "key": video_id,
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "name": "Trailer", "channel": "", "official": False,
                    "source": "Ricerca pubblica YouTube", "score": 60,
                })
    if not candidates:
        return None
    best = max(candidates.values(), key=lambda row: row["score"])
    if best["score"] < 72:
        return None
    best.pop("score", None)
    best["updatedAt"] = datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
    return best


class WatchverseHandler(http.server.SimpleHTTPRequestHandler):
    server_version = "WatchverseLocal/2.0.27"

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

    def send_json(self, payload: Any, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/health":
            self.send_json({"ok": True, "version": "2.0.27"})
            return
        if parsed.path == "/api/trailer":
            query = urllib.parse.parse_qs(parsed.query)
            title = (query.get("title") or [""])[0].strip()
            year = (query.get("year") or [""])[0].strip()
            kind = (query.get("kind") or [""])[0].strip()
            if not title or len(title) > 180:
                self.send_json({"error": "Titolo non valido"}, 400)
                return
            try:
                trailer = cached(f"trailer:{normalize(title)}:{year}:{kind}", lambda: find_public_trailer(title, year, kind))
                self.send_json({"title": title, "trailer": trailer, "checkedAt": datetime.utcnow().isoformat() + "Z"})
            except Exception as error:  # endpoint locale: risposta trasparente, niente stack trace al client
                self.send_json({"title": title, "trailer": None, "error": str(error)}, 502)
            return
        if parsed.path == "/api/cinema":
            query = urllib.parse.parse_qs(parsed.query)
            title = (query.get("title") or [""])[0].strip()
            ids = [value for value in (query.get("cinemas") or [""])[0].split(",") if value in CINEMAS]
            if not title or len(title) > 180:
                self.send_json({"error": "Titolo non valido"}, 400)
                return
            selected = ids or list(CINEMAS)
            cinemas = []
            for cinema_id in selected[:8]:
                try:
                    cinemas.append(cached(f"cinema:{cinema_id}:{normalize(title)}", lambda cinema_id=cinema_id: parse_cinema(cinema_id, title)))
                except Exception as error:
                    cinema = CINEMAS[cinema_id]
                    cinemas.append({
                        "cinemaId": cinema_id, "cinemaName": cinema["name"],
                        "officialUrl": cinema["officialUrl"], "showtimes": [],
                        "available": False, "error": str(error),
                    })
            self.send_json({
                "title": title,
                "cinemas": cinemas,
                "checkedAt": datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
            })
            return
        super().do_GET()


class ReusableThreadingServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def main() -> None:
    url = f"http://localhost:{PORT}/index.html#/home"
    print(f"Watchverse è disponibile su {url}")
    print("Le fonti pubbliche locali sono attive per trailer e siti ufficiali dei cinema.")
    try:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    except Exception:
        pass

    with ReusableThreadingServer(("", PORT), WatchverseHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nWatchverse chiuso.")


if __name__ == '__main__':
    main()
