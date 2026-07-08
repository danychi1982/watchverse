from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import avvia_server as server  # noqa: E402


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def test_youtube_parser() -> None:
    payload = {
        "contents": {
            "videoRenderer": {
                "videoId": "abcdefghijk",
                "title": {"runs": [{"text": "Dune: Parte Due | Trailer Ufficiale Italiano"}]},
                "ownerText": {"runs": [{"text": "Warner Bros. Italia"}]},
            }
        }
    }
    document = "<script>var ytInitialData = " + json.dumps(payload) + ";</script>"
    parsed = server.youtube_initial_data(document)
    check(parsed == payload, "ytInitialData non estratto")
    rows = list(server.walk_video_renderers(parsed))
    check(len(rows) == 1 and rows[0]["videoId"] == "abcdefghijk", "videoRenderer non trovato")
    official = server.trailer_score("Dune Parte Due", "2024", "Dune Parte Due Trailer Ufficiale 2024", "Warner Bros. Italia")
    fan = server.trailer_score("Dune Parte Due", "2024", "Dune Parte Due Fan Trailer 2024", "Fan Channel")
    check(official >= 95, "trailer ufficiale non riconosciuto")
    check(fan < official, "fan trailer non penalizzato")


def test_cinema_parser() -> None:
    document = """
      <main>
        <article><h2>Dune - Parte Due</h2>
          <h3>Sabato 5 luglio</h3><p>17.30 · 20:45</p>
          <h3>Domenica 6 luglio</h3><p>18:10</p>
          <p>Durata 02:46</p>
        </article>
      </main>
    """
    lines = server.visible_lines(document)
    window = server.parse_title_window(lines, "Dune Parte Due")
    check(window, "finestra titolo cinema non trovata")
    shows = server.make_showtimes(window, "https://cinema.example/film", "Sito ufficiale")
    times = [show["time"] for show in shows]
    check(times == ["17:30", "20:45", "18:10"], f"orari inattesi: {times}")
    check(all(show["bookingUrl"] == "https://cinema.example/film" for show in shows), "URL ufficiale non preservato")


def test_whitelist() -> None:
    check("the-space-surbo" in server.CINEMAS, "The Space Surbo mancante")
    check("cinema-massimo-lecce" in server.CINEMAS, "Multisala Massimo mancante")
    check(all(row["officialUrl"].startswith("https://") for row in server.CINEMAS.values()), "fonte cinema non HTTPS")


if __name__ == "__main__":
    test_youtube_parser()
    test_cinema_parser()
    test_whitelist()
    print("✓ Parser locali trailer e cinema ufficiali verificati")
