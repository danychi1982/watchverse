// Supabase Edge Function: tmdb-proxy
// Secrets richiesti: TMDB_READ_TOKEN, SUPABASE_URL, SUPABASE_ANON_KEY
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const allowed = [
  /^\/configuration$/,
  /^\/search\/(movie|tv|person)$/,
  /^\/(movie|tv|person)\/\d+$/,
  /^\/(movie|tv)\/\d+\/(credits|watch\/providers|videos)$/,
  /^\/tv\/\d+\/season\/\d+$/
];

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return Response.json({ error: 'Metodo non consentito' }, { status: 405, headers: cors });

  try {
    const auth = req.headers.get('Authorization') || '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return Response.json({ error: 'Accesso richiesto' }, { status: 401, headers: cors });

    const { path, params = {} } = await req.json();
    if (typeof path !== 'string' || !allowed.some(re => re.test(path))) {
      return Response.json({ error: 'Endpoint TMDB non consentito' }, { status: 400, headers: cors });
    }

    const url = new URL(`https://api.themoviedb.org/3${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
    if (!url.searchParams.has('language') && path !== '/configuration') url.searchParams.set('language', 'it-IT');

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${Deno.env.get('TMDB_READ_TOKEN')}`,
        accept: 'application/json'
      }
    });
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'private, max-age=3600' }
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Errore inatteso' }, { status: 500, headers: cors });
  }
});
