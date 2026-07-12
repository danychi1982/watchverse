// Server-side proxy for the public sources that cannot be read from GitHub Pages
// because cinema sites do not expose browser CORS headers.
// Requires an authenticated Supabase session; no provider credentials are exposed.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const cinemas: Record<string, { name: string; officialUrl: string; filmUrl?: string }> = {
  'the-space-surbo': { name: 'The Space Cinema Surbo', officialUrl: 'https://www.thespacecinema.it/cinema/surbo/al-cinema', filmUrl: 'https://www.thespacecinema.it/cinema/surbo/film/{slug}' },
  'the-space-casamassima': { name: 'The Space Cinema Casamassima', officialUrl: 'https://www.thespacecinema.it/cinema/casamassima/al-cinema', filmUrl: 'https://www.thespacecinema.it/cinema/casamassima/film/{slug}' },
  'cinema-massimo-lecce': { name: 'Multisala Massimo Lecce', officialUrl: 'https://www.multisalamassimo.it/' },
  'db-dessai-lecce': { name: 'Cinema DB d’Essai', officialUrl: 'https://www.cinemadbdessai.it/' }
};

function normalize(value: string) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function slugify(value: string) { return normalize(value).replace(/\s+/g, '-'); }
function stripHtml(value: string) { return value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim(); }

async function trailerResult(title: string, year: string, kind: string) {
  const query = `${title} ${year || ''} trailer ufficiale ${kind === 'series' ? 'serie tv' : 'film'}`.trim();
  const response = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
    headers: { 'user-agent': 'Watchverse/1.0 (+https://danychi1982.github.io/watchverse/)', accept: 'text/html' }, redirect: 'follow'
  });
  if (!response.ok) throw new Error(`Ricerca trailer ${response.status}`);
  const html = await response.text();
  const ids = [...html.matchAll(/"videoId":"([A-Za-z0-9_-]{11})"/g)].map(match => match[1]);
  const key = [...new Set(ids)][0];
  return key ? { site: 'YouTube', key, name: `Trailer di ${title}`, official: false, source: 'public-youtube', url: `https://www.youtube.com/watch?v=${key}` } : null;
}

async function fetchOfficial(url: string) {
  const response = await fetch(url, { headers: { 'user-agent': 'Watchverse/1.0 (+https://danychi1982.github.io/watchverse/)', accept: 'text/html,application/xhtml+xml' }, redirect: 'follow' });
  if (!response.ok) throw new Error(`Fonte cinema ${response.status}`);
  return response.text();
}

function findShowtimes(text: string, title: string) {
  const wanted = normalize(title).split(' ').filter(token => token.length > 2);
  const haystack = normalize(text);
  if (!wanted.length || !wanted.some(token => haystack.includes(token))) return [];
  const rows: Array<{ time: string; dateKey: string; dateLabel: string; bookingUrl: string; source: string }> = [];
  const times = [...text.matchAll(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/g)].map(match => `${match[1].padStart(2, '0')}:${match[2]}`);
  for (const time of [...new Set(times)]) rows.push({ time, dateKey: new Date().toISOString().slice(0, 10), dateLabel: 'Programmazione corrente', bookingUrl: '', source: 'Sito ufficiale esercente' });
  return rows.slice(0, 24);
}

async function cinemaResults(title: string, selected: string[]) {
  const results = [];
  for (const id of selected.slice(0, 8)) {
    const cinema = cinemas[id];
    if (!cinema) continue;
    const urls = [cinema.filmUrl ? cinema.filmUrl.replace('{slug}', slugify(title)) : '', cinema.officialUrl].filter(Boolean);
    let showtimes: ReturnType<typeof findShowtimes> = [];
    let sourceUrl = cinema.officialUrl;
    let error = '';
    for (const url of [...new Set(urls)]) {
      try {
        const body = await fetchOfficial(url);
        showtimes = findShowtimes(stripHtml(body), title);
        sourceUrl = url;
        if (showtimes.length) break;
      } catch (reason) { error = reason instanceof Error ? reason.message : 'Fonte non raggiungibile'; }
    }
    results.push({ cinemaId: id, cinemaName: cinema.name, officialUrl: cinema.officialUrl, sourceUrl, showtimes, available: showtimes.length > 0, error: showtimes.length ? null : (error || null) });
  }
  return results;
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return Response.json({ error: 'Metodo non consentito' }, { status: 405, headers: cors });
  try {
    const authorization = request.headers.get('Authorization') || '';
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Accesso richiesto' }, { status: 401, headers: cors });
    const body = await request.json();
    const path = body?.path;
    const params = body?.params || {};
    if (typeof params.title !== 'string' || !params.title.trim()) return Response.json({ error: 'Titolo obbligatorio' }, { status: 400, headers: cors });
    if (path === '/api/trailer') {
      const trailer = await trailerResult(params.title.trim(), String(params.year || ''), String(params.kind || 'movie'));
      return Response.json({ title: params.title.trim(), trailer, checkedAt: new Date().toISOString() }, { headers: { ...cors, 'Cache-Control': 'private, max-age=2592000' } });
    }
    if (path !== '/api/cinema') return Response.json({ error: 'Endpoint pubblico non consentito' }, { status: 400, headers: cors });
    const selected = String(params.cinemas || '').split(',').filter(id => Object.hasOwn(cinemas, id));
    const data = { title: params.title, cinemas: await cinemaResults(params.title.trim(), selected), checkedAt: new Date().toISOString() };
    return Response.json(data, { headers: { ...cors, 'Cache-Control': 'private, max-age=21600' } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Errore inatteso' }, { status: 502, headers: cors });
  }
});
