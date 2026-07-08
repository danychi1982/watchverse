/* Watchverse public metadata providers
 * - TVmaze: series, episodes, cast and images (CC BY-SA)
 * - Wikipedia/Wikidata/Wikimedia Commons: localized titles, summaries, movie images and cast
 * No API key is required. Results are persisted by Watchverse after enrichment.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WatchversePublicMetadata = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const memoryCache = new Map();
  const TVMAZE = 'https://api.tvmaze.com';
  const WIKIDATA = 'https://www.wikidata.org/w/api.php';
  const COMMONS_FILE = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
  const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql';

  function wikiApi(language = 'it') { return `https://${language}.wikipedia.org/w/api.php`; }
  function wikiBase(language = 'it') { return `https://${language}.wikipedia.org`; }

  function stripHtml(value = '') {
    return String(value)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  function cleanWikiTitle(value = '') {
    return String(value)
      .replace(/\s*\((?:film|serie televisiva|television series|TV series|[12][0-9]{3} film)\)\s*$/i, '')
      .trim();
  }

  function normalize(value = '') {
    return String(value)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\b(the|a|an|il|lo|la|i|gli|le|un|uno|una)\b/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function unique(values = []) {
    const seen = new Set();
    return values.filter(Boolean).map(v => String(v).trim()).filter(v => {
      const key = normalize(v);
      if (!key || seen.has(key)) return false;
      seen.add(key); return true;
    });
  }

  function yearOf(value) {
    const match = String(value || '').match(/(19|20)\d{2}/);
    return match ? Number(match[0]) : null;
  }

  function titleScore(candidate, wanted, candidateYear, wantedYear) {
    const a = normalize(candidate), b = normalize(wanted);
    if (!a || !b) return 0;
    let score = a === b ? 100 : (a.includes(b) || b.includes(a) ? 72 : 0);
    const aa = new Set(a.split(' ')), bb = new Set(b.split(' '));
    const common = [...aa].filter(x => bb.has(x)).length;
    score += common / Math.max(1, new Set([...aa, ...bb]).size) * 45;
    if (wantedYear && candidateYear) {
      const diff = Math.abs(Number(candidateYear) - Number(wantedYear));
      score += diff === 0 ? 28 : diff === 1 ? 12 : diff <= 3 ? 4 : -18;
    }
    return score;
  }

  function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  async function fetchJson(url, options = {}, attempt = 0) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || 16000);
    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: { Accept: 'application/json', ...(options.headers || {}) },
        body: options.body,
        signal: controller.signal,
        redirect: 'follow'
      });
      if ((response.status === 429 || response.status >= 500) && attempt < 2) {
        const retry = Math.max(900, Number(response.headers.get('Retry-After') || 0) * 1000 || (attempt + 1) * 1400);
        await wait(retry);
        return fetchJson(url, options, attempt + 1);
      }
      if (!response.ok) throw new Error(`Fonte metadati non disponibile (${response.status})`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  function cached(key, loader) {
    if (memoryCache.has(key)) return memoryCache.get(key);
    const promise = Promise.resolve().then(loader).catch(error => {
      memoryCache.delete(key);
      throw error;
    });
    memoryCache.set(key, promise);
    return promise;
  }

  async function wikipediaSearchLanguage({ title, alternativeTitles = [], year = null, kind = 'movie', language = 'it' }) {
    const qualifier = kind === 'tv'
      ? (language === 'it' ? 'serie televisiva' : 'television series')
      : 'film';
    const wantedTitles = unique([title, ...alternativeTitles]);
    let best = null;

    for (const wanted of wantedTitles.slice(0, 3)) {
      const query = [wanted, year, qualifier].filter(Boolean).join(' ');
      const params = new URLSearchParams({
        action: 'query', generator: 'search', gsrsearch: query, gsrnamespace: '0', gsrlimit: '10',
        prop: 'pageimages|extracts|pageprops', exintro: '1', explaintext: '1', exchars: '2500',
        piprop: 'original|thumbnail', pithumbsize: '700', redirects: '1', format: 'json', origin: '*'
      });
      const data = await fetchJson(`${wikiApi(language)}?${params}`);
      const pages = Object.values(data?.query?.pages || {}).filter(page => !page.pageprops?.disambiguation);
      for (const page of pages) {
        const candidateYear = yearOf(page.title + ' ' + (page.extract || ''));
        const score = Math.max(...wantedTitles.map(t => titleScore(cleanWikiTitle(page.title), t, candidateYear, year)));
        if (!best || score > best.score) {
          best = {
            score,
            title: cleanWikiTitle(page.title),
            pageTitle: page.title,
            overview: stripHtml(page.extract || ''),
            poster: page.original?.source || page.thumbnail?.source || null,
            wikidataId: page.pageprops?.wikibase_item || null,
            sourceUrl: `${wikiBase(language)}/?curid=${page.pageid}`,
            sourceLabel: language === 'it' ? 'Wikipedia in italiano' : 'Wikipedia in inglese',
            language,
            pageid: page.pageid
          };
        }
      }
      if (best?.score >= 105) break;
    }
    return best && best.score >= 34 ? best : null;
  }

  async function wikipediaPageByTitle(pageTitle, language = 'it') {
    if (!pageTitle) return null;
    const params = new URLSearchParams({
      action: 'query', titles: pageTitle, prop: 'pageimages|extracts|pageprops', exintro: '1', explaintext: '1', exchars: '2500',
      piprop: 'original|thumbnail', pithumbsize: '700', redirects: '1', format: 'json', origin: '*'
    });
    const data = await fetchJson(`${wikiApi(language)}?${params}`);
    const page = Object.values(data?.query?.pages || {})[0];
    if (!page || page.missing !== undefined || page.pageprops?.disambiguation) return null;
    return {
      title: cleanWikiTitle(page.title), pageTitle: page.title,
      overview: stripHtml(page.extract || ''),
      poster: page.original?.source || page.thumbnail?.source || null,
      wikidataId: page.pageprops?.wikibase_item || null,
      sourceUrl: `${wikiBase(language)}/?curid=${page.pageid}`,
      sourceLabel: language === 'it' ? 'Wikipedia in italiano' : 'Wikipedia in inglese',
      language, pageid: page.pageid, score: 120
    };
  }

  function claimIds(entity, property) {
    return (entity?.claims?.[property] || [])
      .map(claim => claim?.mainsnak?.datavalue?.value?.id)
      .filter(Boolean);
  }

  function commonsImage(entity, width = 420) {
    const filename = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    return filename ? `${COMMONS_FILE}${encodeURIComponent(filename)}?width=${width}` : null;
  }

  function claimYear(entity) {
    const time = entity?.claims?.P577?.[0]?.mainsnak?.datavalue?.value?.time;
    return yearOf(time);
  }

  function entityLabel(entity, language = 'it') {
    return entity?.labels?.[language]?.value || entity?.labels?.en?.value || entity?.labels?.it?.value || '';
  }

  function entityAliases(entity, language) {
    return (entity?.aliases?.[language] || []).map(x => x.value).filter(Boolean);
  }

  async function wikidataEntities(ids = []) {
    if (!ids.length) return {};
    const params = new URLSearchParams({
      action: 'wbgetentities', ids: ids.join('|'), props: 'labels|aliases|descriptions|claims|sitelinks',
      languages: 'it|en', languagefallback: '1', format: 'json', origin: '*'
    });
    const data = await fetchJson(`${WIKIDATA}?${params}`);
    return data?.entities || {};
  }

  async function findWikidataMovie({ title, originalTitle, year = null, imdbId = null }) {
    const ids = [];
    if (imdbId) {
      try {
        const params = new URLSearchParams({
          action: 'query', list: 'search', srsearch: `haswbstatement:P345=${imdbId}`,
          srnamespace: '0', srlimit: '5', format: 'json', origin: '*'
        });
        const result = await fetchJson(`${WIKIDATA}?${params}`);
        ids.push(...(result?.query?.search || []).map(x => x.title));
      } catch { /* continue with title search */ }
    }
    for (const language of ['it', 'en']) {
      for (const wanted of unique([title, originalTitle]).slice(0, 2)) {
        try {
          const params = new URLSearchParams({
            action: 'wbsearchentities', search: wanted, language, uselang: language,
            type: 'item', limit: '8', format: 'json', origin: '*'
          });
          const result = await fetchJson(`${WIKIDATA}?${params}`);
          ids.push(...(result?.search || []).map(x => x.id));
        } catch { /* try other language/title */ }
      }
    }
    const uniqueIds = [...new Set(ids)].slice(0, 25);
    const entities = await wikidataEntities(uniqueIds);
    const wanted = unique([title, originalTitle]);
    const candidates = uniqueIds.map(id => entities[id]).filter(Boolean).map(entity => {
      const names = unique([entityLabel(entity, 'it'), entityLabel(entity, 'en'), ...entityAliases(entity, 'it'), ...entityAliases(entity, 'en')]);
      const score = Math.max(0, ...names.flatMap(name => wanted.map(w => titleScore(name, w, claimYear(entity), year))));
      const imdb = entity?.claims?.P345?.[0]?.mainsnak?.datavalue?.value;
      return { entity, score: score + (imdbId && imdb === imdbId ? 200 : 0) };
    }).sort((a, b) => b.score - a.score);
    return candidates[0]?.score >= 34 ? candidates[0].entity : null;
  }

  async function wikidataCast(wikidataId, limit = 18) {
    if (!wikidataId) return [];
    const root = await wikidataEntities([wikidataId]);
    const entity = root?.[wikidataId];
    const ids = claimIds(entity, 'P161').slice(0, limit);
    if (!ids.length) return [];
    const people = await wikidataEntities(ids);
    return ids.map(id => {
      const person = people?.[id];
      const name = entityLabel(person, 'it') || entityLabel(person, 'en') || id;
      return {
        name,
        role: 'Cast',
        wikidataId: id,
        photo: commonsImage(person, 360),
        sourceUrl: `https://www.wikidata.org/wiki/${id}`
      };
    });
  }

  function mapTvmazeSeries(show) {
    const embeddedEpisodes = show?._embedded?.episodes || [];
    const seasons = new Map();
    for (const episode of embeddedEpisodes) {
      if (episode.season == null || episode.number == null) continue;
      if (!seasons.has(Number(episode.season))) {
        seasons.set(Number(episode.season), {
          number: Number(episode.season),
          name: Number(episode.season) === 0 ? 'Speciali' : `Stagione ${episode.season}`,
          overview: '', airDate: episode.airdate || null, episodes: []
        });
      }
      const season = seasons.get(Number(episode.season));
      if (!season.airDate || (episode.airdate && episode.airdate < season.airDate)) season.airDate = episode.airdate;
      season.episodes.push({
        id: `tvmaze-episode-${episode.id}`,
        tvmazeId: episode.id,
        season: Number(episode.season),
        episode: Number(episode.number),
        title: episode.name || `Episodio ${episode.number}`,
        overview: stripHtml(episode.summary || ''),
        runtime: episode.runtime || episode._runtime || show.runtime || show.averageRuntime || 50,
        airDate: episode.airdate || null,
        airStamp: episode.airstamp || null,
        image: episode.image?.original || episode.image?.medium || null,
        source: 'tvmaze'
      });
    }
    for (const season of seasons.values()) season.episodes.sort((a, b) => a.episode - b.episode);
    const cast = (show?._embedded?.cast || []).slice(0, 24).map(item => ({
      name: item.person?.name || 'Interprete',
      role: item.character?.name || '',
      tvmazeId: item.person?.id || null,
      photo: item.person?.image?.medium || item.person?.image?.original || null,
      sourceUrl: item.person?.url || null
    }));
    return {
      provider: 'tvmaze', providerLabel: 'TVmaze', providerId: show.id,
      title: show.name, originalTitle: show.name,
      year: yearOf(show.premiered), overview: stripHtml(show.summary || ''),
      genres: show.genres || [], runtime: show.averageRuntime || show.runtime || null,
      statusText: show.status || null,
      poster: show.image?.original || show.image?.medium || null,
      backdrop: show.image?.original || null,
      network: show.network?.name || show.webChannel?.name || null,
      officialSite: show.officialSite || null,
      sourceUrl: show.url || null,
      imdbId: show.externals?.imdb || null,
      tvdbId: show.externals?.thetvdb || null,
      cast, seasons: [...seasons.values()].sort((a, b) => a.number - b.number)
    };
  }

  async function findTvmazeShow({ title, originalTitle = null, aliases = [], year = null, tvdbId = null }) {
    if (tvdbId) {
      try { return await fetchJson(`${TVMAZE}/lookup/shows?thetvdb=${encodeURIComponent(tvdbId)}`); }
      catch { /* fallback to title search */ }
    }
    const wantedTitles = unique([originalTitle, title, ...aliases]);
    const candidates = [];
    for (const wanted of wantedTitles.slice(0, 3)) {
      try {
        const results = await fetchJson(`${TVMAZE}/search/shows?q=${encodeURIComponent(wanted)}`);
        candidates.push(...(results || []).map(row => row.show).filter(Boolean));
      } catch { /* try next title */ }
    }
    const dedup = [...new Map(candidates.map(x => [x.id, x])).values()];
    dedup.sort((a, b) => {
      const sb = Math.max(...wantedTitles.map(w => titleScore(b.name, w, yearOf(b.premiered), year)));
      const sa = Math.max(...wantedTitles.map(w => titleScore(a.name, w, yearOf(a.premiered), year)));
      return sb - sa;
    });
    const best = dedup[0];
    const score = best ? Math.max(...wantedTitles.map(w => titleScore(best.name, w, yearOf(best.premiered), year))) : 0;
    return best && score >= 35 ? best : null;
  }

  async function lookupSeries(input = {}, options = {}) {
    const key = `series:${input.tvdbId || normalize(input.originalTitle || input.title)}:${input.year || ''}:${options.includeCast === true}`;
    return cached(key, async () => {
      const basic = await findTvmazeShow(input);
      if (!basic) throw new Error(`Nessuna corrispondenza pubblica trovata per “${input.title}”.`);
      const embed = options.includeCast === true ? 'embed[]=episodes&embed[]=cast' : 'embed=episodes';
      const show = await fetchJson(`${TVMAZE}/shows/${basic.id}?${embed}`);
      const mapped = mapTvmazeSeries(show);
      let itWiki = null, enWiki = null;
      try {
        itWiki = await wikipediaSearchLanguage({
          title: input.title || mapped.title,
          alternativeTitles: unique([mapped.originalTitle, input.originalTitle, ...(input.aliases || [])]),
          year: mapped.year || input.year, kind: 'tv', language: 'it'
        });
      } catch { /* TVmaze remains usable */ }
      if (!itWiki || !itWiki.overview) {
        try {
          enWiki = await wikipediaSearchLanguage({
            title: mapped.originalTitle || input.originalTitle || input.title,
            alternativeTitles: unique([input.title, ...(input.aliases || [])]),
            year: mapped.year || input.year, kind: 'tv', language: 'en'
          });
        } catch { /* TVmaze remains usable */ }
      }
      const localTitle = itWiki?.title || input.title || mapped.title;
      const originalTitle = mapped.originalTitle || input.originalTitle || input.title;
      return {
        ...mapped,
        title: localTitle,
        originalTitle,
        overview: itWiki?.overview || mapped.overview || enWiki?.overview || '',
        poster: mapped.poster || itWiki?.poster || enWiki?.poster || null,
        backdrop: mapped.backdrop || mapped.poster || itWiki?.poster || enWiki?.poster || null,
        language: itWiki?.overview ? 'it' : 'en',
        aliases: unique([localTitle, originalTitle, input.title, input.originalTitle, ...(input.aliases || []), itWiki?.title, enWiki?.title]),
        italianSourceUrl: itWiki?.sourceUrl || null,
        italianSourceLabel: itWiki?.sourceLabel || null,
        englishSourceUrl: enWiki?.sourceUrl || null,
        coreComplete: true,
        castComplete: options.includeCast === true,
        episodesComplete: true
      };
    });
  }

  async function lookupMovie(input = {}, options = {}) {
    const key = `movie:${input.imdbId || normalize(input.originalTitle || input.title)}:${input.year || ''}:${options.includeCast !== false}`;
    return cached(key, async () => {
      const alt = unique([input.originalTitle, ...(input.aliases || [])]);
      let itWiki = null, enWiki = null;
      try { itWiki = await wikipediaSearchLanguage({ title: input.title, alternativeTitles: alt, year: input.year, kind: 'movie', language: 'it' }); }
      catch { /* English/Wikidata fallback below */ }
      try { enWiki = await wikipediaSearchLanguage({ title: input.originalTitle || input.title, alternativeTitles: unique([input.title, ...alt]), year: input.year, kind: 'movie', language: 'en' }); }
      catch { /* Wikidata fallback below */ }

      let wikidataId = itWiki?.wikidataId || enWiki?.wikidataId || null;
      let entity = null;
      if (wikidataId) entity = (await wikidataEntities([wikidataId]))?.[wikidataId] || null;
      if (!entity) {
        entity = await findWikidataMovie(input);
        wikidataId = entity?.id || wikidataId;
      }
      if (entity) {
        const itTitle = entity?.sitelinks?.itwiki?.title;
        const enTitle = entity?.sitelinks?.enwiki?.title;
        if (!itWiki && itTitle) { try { itWiki = await wikipediaPageByTitle(itTitle, 'it'); } catch {} }
        if (!enWiki && enTitle) { try { enWiki = await wikipediaPageByTitle(enTitle, 'en'); } catch {} }
      }

      if (!itWiki && !enWiki && !entity) throw new Error(`Nessuna scheda pubblica trovata per “${input.title}”.`);

      let cast = [];
      if (options.includeCast !== false && wikidataId) {
        try { cast = await wikidataCast(wikidataId, options.castLimit || 18); }
        catch { cast = []; }
      }
      const entityIt = entityLabel(entity, 'it');
      const entityEn = entityLabel(entity, 'en');
      const localTitle = itWiki?.title || entityIt || input.title || enWiki?.title || entityEn;
      const inferredOriginal = input.originalTitle || (enWiki?.title && normalize(enWiki.title) !== normalize(localTitle) ? enWiki.title : null) || entityEn || input.title;
      const overview = itWiki?.overview || enWiki?.overview || entity?.descriptions?.it?.value || entity?.descriptions?.en?.value || '';
      const poster = itWiki?.poster || enWiki?.poster || commonsImage(entity, 700) || null;
      return {
        provider: 'wikipedia', providerLabel: itWiki ? 'Wikipedia/Wikidata' : 'Wikipedia EN/Wikidata',
        title: localTitle,
        originalTitle: inferredOriginal,
        year: input.year || claimYear(entity) || yearOf((itWiki?.pageTitle || '') + ' ' + (enWiki?.pageTitle || '') + ' ' + overview),
        overview,
        poster, backdrop: poster,
        wikidataId,
        imdbId: input.imdbId || entity?.claims?.P345?.[0]?.mainsnak?.datavalue?.value || null,
        sourceUrl: itWiki?.sourceUrl || enWiki?.sourceUrl || (wikidataId ? `https://www.wikidata.org/wiki/${wikidataId}` : null),
        italianSourceUrl: itWiki?.sourceUrl || null,
        englishSourceUrl: enWiki?.sourceUrl || null,
        cast, genres: [], runtime: null,
        language: itWiki?.overview ? 'it' : 'en',
        aliases: unique([localTitle, inferredOriginal, input.title, input.originalTitle, ...(input.aliases || []), itWiki?.title, enWiki?.title, entityIt, entityEn, ...entityAliases(entity, 'it'), ...entityAliases(entity, 'en')]),
        coreComplete: true,
        castComplete: options.includeCast !== false
      };
    });
  }


  function claimValue(entity, property) {
    return entity?.claims?.[property]?.[0]?.mainsnak?.datavalue?.value ?? null;
  }

  function wikidataDate(entity, property) {
    const raw = claimValue(entity, property)?.time;
    if (!raw) return null;
    const match = String(raw).match(/[+-](\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
  }

  async function findWikidataPerson(name, preferredId = null) {
    if (preferredId) {
      const entities = await wikidataEntities([preferredId]);
      if (entities?.[preferredId]) return entities[preferredId];
    }
    const ids = [];
    for (const language of ['it', 'en']) {
      try {
        const params = new URLSearchParams({
          action: 'wbsearchentities', search: name, language, uselang: language,
          type: 'item', limit: '10', format: 'json', origin: '*'
        });
        const data = await fetchJson(`${WIKIDATA}?${params}`);
        ids.push(...(data?.search || []).map(x => x.id));
      } catch { /* fallback */ }
    }
    const uniqueIds = [...new Set(ids)].slice(0, 20);
    const entities = await wikidataEntities(uniqueIds);
    const wanted = normalize(name);
    const candidates = uniqueIds.map(id => entities[id]).filter(Boolean).map(entity => {
      const names = unique([entityLabel(entity, 'it'), entityLabel(entity, 'en'), ...entityAliases(entity, 'it'), ...entityAliases(entity, 'en')]);
      const occupationIds = claimIds(entity, 'P106');
      const occupationBonus = occupationIds.some(x => ['Q33999','Q10800557','Q2259451','Q2405480','Q2526255'].includes(x)) ? 22 : 0;
      const score = Math.max(0, ...names.map(x => titleScore(x, wanted))) + occupationBonus;
      return { entity, score };
    }).sort((a,b) => b.score-a.score);
    return candidates[0]?.score >= 70 ? candidates[0].entity : null;
  }

  async function wikipediaPersonPage(name, entity, language = 'it') {
    const sitelink = entity?.sitelinks?.[`${language}wiki`]?.title;
    if (sitelink) {
      const page = await wikipediaPageByTitle(sitelink, language);
      if (page) return page;
    }
    const qualifiers = language === 'it' ? ['attore', 'attrice', 'regista'] : ['actor', 'actress', 'director'];
    let best = null;
    for (const qualifier of qualifiers) {
      const params = new URLSearchParams({
        action: 'query', generator: 'search', gsrsearch: `${name} ${qualifier}`, gsrnamespace: '0', gsrlimit: '8',
        prop: 'pageimages|extracts|pageprops', exintro: '1', explaintext: '1', exchars: '5200',
        piprop: 'original|thumbnail', pithumbsize: '900', redirects: '1', format: 'json', origin: '*'
      });
      try {
        const data = await fetchJson(`${wikiApi(language)}?${params}`);
        const pages = Object.values(data?.query?.pages || {}).filter(page => !page.pageprops?.disambiguation);
        for (const page of pages) {
          const score = titleScore(cleanWikiTitle(page.title), name);
          if (!best || score > best.score) best = {
            score, title: cleanWikiTitle(page.title), pageTitle: page.title,
            overview: stripHtml(page.extract || ''), poster: page.original?.source || page.thumbnail?.source || null,
            wikidataId: page.pageprops?.wikibase_item || null,
            sourceUrl: `${wikiBase(language)}/?curid=${page.pageid}`,
            sourceLabel: language === 'it' ? 'Wikipedia in italiano' : 'Wikipedia in inglese',
            language, pageid: page.pageid
          };
        }
      } catch { /* try next qualifier */ }
      if (best?.score >= 95) break;
    }
    return best && best.score >= 60 ? best : null;
  }

  async function findTvmazePerson(name, tvmazeId = null) {
    if (tvmazeId) {
      try { return await fetchJson(`${TVMAZE}/people/${encodeURIComponent(tvmazeId)}`); } catch { /* search fallback */ }
    }
    const rows = await fetchJson(`${TVMAZE}/search/people?q=${encodeURIComponent(name)}`);
    const sorted = (rows || []).map(r => r.person).filter(Boolean).sort((a,b) => titleScore(b.name,name)-titleScore(a.name,name));
    return sorted[0] && titleScore(sorted[0].name,name) >= 70 ? sorted[0] : null;
  }

  async function tvmazePersonCredits(personId) {
    if (!personId) return [];
    try {
      const rows = await fetchJson(`${TVMAZE}/people/${personId}/castcredits?embed=show`);
      return (rows || []).map(row => {
        const show = row?._embedded?.show;
        if (!show) return null;
        return {
          kind: 'tv', source: 'TVmaze', sourceId: show.id, title: show.name,
          year: yearOf(show.premiered), role: row?._links?.character?.name || '',
          poster: show.image?.medium || show.image?.original || null,
          sourceUrl: show.url || null
        };
      }).filter(Boolean);
    } catch { return []; }
  }

  async function wikidataFilmCredits(personQid) {
    if (!personQid) return [];
    const query = `SELECT DISTINCT ?work ?workLabel ?date ?image ?characterLabel WHERE {
      ?work p:P161 ?castStatement .
      ?castStatement ps:P161 wd:${personQid} .
      ?work wdt:P31/wdt:P279* wd:Q11424 .
      OPTIONAL { ?castStatement pq:P4633 ?character . }
      OPTIONAL { ?work wdt:P577 ?date . }
      OPTIONAL { ?work wdt:P18 ?image . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
    } ORDER BY DESC(?date) LIMIT 260`;
    try {
      const data = await fetchJson(`${WIKIDATA_SPARQL}?query=${encodeURIComponent(query)}&format=json`, { timeout: 24000, headers: { 'Accept': 'application/sparql-results+json' } });
      const map = new Map();
      for (const row of data?.results?.bindings || []) {
        const qid = row.work?.value?.split('/').pop();
        const title = row.workLabel?.value || qid;
        const key = `${qid || normalize(title)}:${yearOf(row.date?.value) || ''}`;
        const old = map.get(key);
        const credit = {
          kind: 'movie', source: 'Wikidata', sourceId: qid, title,
          year: yearOf(row.date?.value), role: row.characterLabel?.value || old?.role || '',
          poster: row.image?.value || old?.poster || null,
          sourceUrl: qid ? `https://www.wikidata.org/wiki/${qid}` : null
        };
        map.set(key, { ...old, ...credit });
      }
      return [...map.values()];
    } catch { return []; }
  }

  async function lookupPerson(input = {}) {
    const key = `person:${input.tvmazeId || input.wikidataId || normalize(input.name)}`;
    return cached(key, async () => {
      const name = input.name || 'Interprete';
      const [tvPerson, wdEntity] = await Promise.all([
        findTvmazePerson(name, input.tvmazeId).catch(() => null),
        findWikidataPerson(name, input.wikidataId).catch(() => null)
      ]);
      const wikidataId = wdEntity?.id || input.wikidataId || null;
      const [itWiki, enWiki, tvCredits, movieCredits] = await Promise.all([
        wikipediaPersonPage(name, wdEntity, 'it').catch(() => null),
        wikipediaPersonPage(name, wdEntity, 'en').catch(() => null),
        tvmazePersonCredits(tvPerson?.id || input.tvmazeId).catch(() => []),
        wikidataFilmCredits(wikidataId).catch(() => [])
      ]);
      let placeOfBirth = '';
      const placeId = claimIds(wdEntity, 'P19')[0];
      if (placeId) {
        try { placeOfBirth = entityLabel((await wikidataEntities([placeId]))?.[placeId], 'it') || entityLabel((await wikidataEntities([placeId]))?.[placeId], 'en'); } catch {}
      }
      const imdbId = claimValue(wdEntity, 'P345') || null;
      const tmdbPersonId = claimValue(wdEntity, 'P4985') || null;
      const website = claimValue(wdEntity, 'P856') || null;
      const instagram = claimValue(wdEntity, 'P2003') || null;
      const twitter = claimValue(wdEntity, 'P2002') || null;
      const bio = itWiki?.overview || enWiki?.overview || wdEntity?.descriptions?.it?.value || wdEntity?.descriptions?.en?.value || '';
      const photo = tvPerson?.image?.original || tvPerson?.image?.medium || itWiki?.poster || enWiki?.poster || commonsImage(wdEntity, 900) || null;
      const creditsMap = new Map();
      for (const credit of [...tvCredits, ...movieCredits]) {
        const ck = `${credit.kind}:${normalize(credit.title)}:${credit.year || ''}`;
        if (!creditsMap.has(ck)) creditsMap.set(ck, credit);
      }
      const filmography = [...creditsMap.values()].sort((a,b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));
      return {
        name: tvPerson?.name || itWiki?.title || enWiki?.title || name,
        photo, biography: bio, birthday: wikidataDate(wdEntity, 'P569') || tvPerson?.birthday || null,
        deathday: wikidataDate(wdEntity, 'P570') || tvPerson?.deathday || null,
        placeOfBirth, country: tvPerson?.country?.name || '', gender: tvPerson?.gender || '',
        tvmazeId: tvPerson?.id || input.tvmazeId || null, wikidataId,
        tmdbPersonId, imdbId, filmography,
        links: {
          wikipediaIt: itWiki?.sourceUrl || null, wikipediaEn: enWiki?.sourceUrl || null,
          wikidata: wikidataId ? `https://www.wikidata.org/wiki/${wikidataId}` : null,
          tvmaze: tvPerson?.url || null,
          tmdb: tmdbPersonId ? `https://www.themoviedb.org/person/${tmdbPersonId}` : null,
          imdb: imdbId ? `https://www.imdb.com/name/${imdbId}` : null,
          website, instagram: instagram ? `https://www.instagram.com/${instagram}/` : null,
          twitter: twitter ? `https://x.com/${twitter}` : null
        },
        sourceLabel: [itWiki ? 'Wikipedia IT' : enWiki ? 'Wikipedia EN' : null, tvPerson ? 'TVmaze' : null, wdEntity ? 'Wikidata' : null].filter(Boolean).join(' · '),
        updatedAt: new Date().toISOString()
      };
    });
  }

  const italyScheduleCache = new Map();
  async function italyScheduleForDate(dateKey) {
    if (!dateKey) return [];
    if (italyScheduleCache.has(dateKey)) return italyScheduleCache.get(dateKey);
    const promise = Promise.allSettled([
      fetchJson(`${TVMAZE}/schedule?country=IT&date=${encodeURIComponent(dateKey)}`),
      fetchJson(`${TVMAZE}/schedule/web?country=IT&date=${encodeURIComponent(dateKey)}`)
    ]).then(results => results.flatMap(x => x.status === 'fulfilled' ? x.value : []));
    italyScheduleCache.set(dateKey, promise);
    return promise;
  }

  function timeInRome(iso) {
    if (!iso) return '';
    return new Intl.DateTimeFormat('it-IT', { hour:'2-digit', minute:'2-digit', timeZone:'Europe/Rome', hour12:false }).format(new Date(iso));
  }
  function dateInRome(iso) {
    if (!iso) return '';
    const parts = new Intl.DateTimeFormat('en-CA', { year:'numeric', month:'2-digit', day:'2-digit', timeZone:'Europe/Rome' }).formatToParts(new Date(iso));
    const m = Object.fromEntries(parts.map(x => [x.type, x.value]));
    return `${m.year}-${m.month}-${m.day}`;
  }

  async function lookupItalySchedule(input = {}) {
    const originalDate = input.originalDate || dateInRome(input.airStamp);
    if (!originalDate) return null;
    const dates = unique([originalDate, dateInRome(input.airStamp), (() => { const d = new Date(`${originalDate}T12:00:00`); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10); })()]);
    for (const dateKey of dates) {
      const rows = await italyScheduleForDate(dateKey).catch(() => []);
      const match = (rows || []).find(ep => {
        if (input.tvmazeEpisodeId && Number(ep.id) === Number(input.tvmazeEpisodeId)) return true;
        const show = ep?._embedded?.show || ep?.show;
        const sameShow = input.tvmazeShowId && Number(show?.id) === Number(input.tvmazeShowId);
        const sameNumber = Number(ep.season) === Number(input.season) && Number(ep.number) === Number(input.episode);
        const sameTitle = normalize(show?.name || '') === normalize(input.seriesTitle || '');
        return sameNumber && (sameShow || sameTitle);
      });
      if (match) {
        const show = match?._embedded?.show || match?.show || {};
        const stamp = match.airstamp || null;
        return {
          dateKey: match.airdate || dateKey,
          time: match.airtime || timeInRome(stamp),
          airStamp: stamp,
          provider: show.webChannel?.name || show.network?.name || input.fallbackProvider || '',
          guideUrl: show.officialSite || show.webChannel?.officialSite || show.network?.officialSite || '',
          webChannel: !!show.webChannel,
          source: 'TVmaze palinsesto Italia', exact: true, confidence: 'exact'
        };
      }
    }
    if (input.airStamp) {
      return {
        dateKey: dateInRome(input.airStamp), time: timeInRome(input.airStamp), airStamp: input.airStamp,
        provider: input.fallbackProvider || '', source: 'Conversione automatica dell’orario originale in Italia',
        exact: false, confidence: 'estimated'
      };
    }
    return null;
  }

  async function searchSeries(query) {
    const results = [];
    try {
      const tvmaze = await fetchJson(`${TVMAZE}/search/shows?q=${encodeURIComponent(query)}`);
      results.push(...(tvmaze || []).slice(0, 12).map(row => {
        const show = row.show;
        return {
          kind: 'tv', publicProvider: 'tvmaze', id: show.id, title: show.name, originalTitle: show.name,
          aliases: [show.name], year: yearOf(show.premiered), overview: stripHtml(show.summary || ''),
          poster: show.image?.medium || show.image?.original || null,
          tvdbId: show.externals?.thetvdb || null, score: row.score || 0
        };
      }));
    } catch { /* Wikipedia fallback below */ }
    try {
      const wiki = await wikipediaSearchLanguage({ title: query, kind: 'tv', language: 'it' });
      if (wiki) results.unshift({ kind: 'tv', publicProvider: 'wikipedia', id: `itwiki-${wiki.pageid}`, title: wiki.title, originalTitle: query, aliases: unique([wiki.title, query]), year: yearOf(wiki.pageTitle + ' ' + wiki.overview), overview: wiki.overview, poster: wiki.poster, wikidataId: wiki.wikidataId, score: 1 });
    } catch {}
    return [...new Map(results.map(x => [`${normalize(x.title)}:${x.year || ''}`, x])).values()].slice(0, 12);
  }

  async function wikiSearchResults(query, language) {
    const params = new URLSearchParams({
      action: 'query', generator: 'search', gsrsearch: `${query} film`, gsrnamespace: '0', gsrlimit: '12',
      prop: 'pageimages|extracts|pageprops', exintro: '1', explaintext: '1', exchars: '650',
      piprop: 'thumbnail', pithumbsize: '360', format: 'json', origin: '*'
    });
    const data = await fetchJson(`${wikiApi(language)}?${params}`);
    return Object.values(data?.query?.pages || {})
      .filter(page => !page.pageprops?.disambiguation)
      .map(page => ({
        kind: 'movie', publicProvider: language === 'it' ? 'wikipedia-it' : 'wikipedia-en', id: `${language}-${page.pageid}`,
        title: cleanWikiTitle(page.title), originalTitle: language === 'en' ? cleanWikiTitle(page.title) : null,
        aliases: [cleanWikiTitle(page.title)], year: yearOf(page.title + ' ' + (page.extract || '')),
        overview: stripHtml(page.extract || ''), poster: page.thumbnail?.source || null,
        wikidataId: page.pageprops?.wikibase_item || null, wikipediaPageId: page.pageid, language
      }));
  }

  async function searchMovies(query) {
    const batches = await Promise.allSettled([wikiSearchResults(query, 'it'), wikiSearchResults(query, 'en')]);
    const all = batches.flatMap(x => x.status === 'fulfilled' ? x.value : []);
    const merged = new Map();
    for (const item of all) {
      const key = item.wikidataId || `${normalize(item.title)}:${item.year || ''}`;
      const old = merged.get(key);
      if (!old || item.language === 'it') merged.set(key, { ...old, ...item, aliases: unique([...(old?.aliases || []), ...(item.aliases || []), old?.title, item.title]) });
      else old.aliases = unique([...(old.aliases || []), item.title]);
    }
    return [...merged.values()].slice(0, 14);
  }

  return {
    lookupSeries, lookupMovie, lookupPerson, lookupItalySchedule, searchSeries, searchMovies,
    stripHtml, cleanWikiTitle, normalize, titleScore,
    attribution: {
      series: 'Dati di serie, episodi e cast forniti da TVmaze (CC BY-SA); titoli e descrizioni localizzati tramite Wikipedia.',
      movies: 'Titoli, descrizioni, immagini e cast da Wikipedia/Wikidata/Wikimedia Commons, con fallback italiano/inglese.'
    }
  };
});
