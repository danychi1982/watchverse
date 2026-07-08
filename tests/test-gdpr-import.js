'use strict';
const assert = require('assert');
const GDPR = require('../gdpr-import.js');

const csvEscape = value => {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const table = (headers, rows) => [headers.join(','), ...rows.map(row => headers.map(h => csvEscape(row[h])).join(','))].join('\n') + '\n';

const v2Headers = ['ep_watch_count','user_id','movie_watch_count','key','series_follow_count','total_movies_runtime','total_series_runtime','created_at','updated_at','is_for_later','is_followed','series_name','uuid','is_archived','most_recent_ep_watched','s_id','followed_at','runtime','episode_id','s_no','gsi','ep_id','is_unitary','ep_no','episode_number','season_number','rewatch_count','bulk_type','is_special'];
const oldHeaders = ['watch_count','series_id','uuid','updated_at','series_name','created_at','user_id','type','type-uuid-n','watches','entity_type','rewatch_count','release_date','follow_date_range_key','movie_name','runtime','release_date_range_key','alpha_range_key','series_uuid','watch_date','episode_number','season_number','episode_id','total_series_runtime','total_movies_runtime','watch_date_range_key','country','watched_episode_range_key','unitarian','bulk_type'];

const entries = [
  { name: 'tracking-prod-records-v2.csv', text: () => table(v2Headers, [
    { ep_watch_count: 1, user_id: 1, key: 'user-series-a', created_at: '2024-01-01', updated_at: '2024-01-02', is_for_later: false, is_followed: true, series_name: 'Serie Prova', uuid: 'a', is_archived: false, s_id: 123 },
    { user_id: 1, key: 'watch-episode-a', created_at: '2024-01-03', updated_at: '2024-01-03', series_name: 'Serie Prova', s_id: 123, runtime: 3000, episode_id: 9001, s_no: 1, ep_no: 1, episode_number: 1, season_number: 1, rewatch_count: 0 }
  ]) },
  { name: 'tracking-prod-records.csv', text: () => table(oldHeaders, [
    { uuid: 'mov-1', updated_at: '2024-01-05', created_at: '2024-01-01', user_id: 1, type: 'watch', entity_type: 'movie', release_date: '2023-02-01', movie_name: 'Film Prova', runtime: 7200, watch_date: '2024-01-05' }
  ]) },
  { name: 'lists-prod-lists.csv', text: () => table(['s_key','objects'], [
    { s_key: 'favorite-series', objects: 'map[id:123]' },
    { s_key: 'favorite-movies', objects: 'map[uuid:mov-1]' }
  ]) },
  { name: 'ratings-live-votes.csv', text: () => table(['user_id','movie_name','vote_key','uuid','episode_id'], [
    { user_id: 1, movie_name: 'Film Prova', vote_key: 'mov-1-1-28', uuid: 'mov-1', episode_id: 0 }
  ]) },
  { name: 'access_token.csv', text: () => 'token\nsegreto\n' }
];

const plan = GDPR.buildPlan(entries);
assert.strictEqual(plan.series.length, 1);
assert.strictEqual(plan.series[0].favorite, true);
assert.strictEqual(plan.progress.length, 1);
assert.strictEqual(plan.movies.length, 1);
assert.strictEqual(plan.movies[0].watched, true);
assert.strictEqual(plan.movies[0].favorite, true);
assert.strictEqual(plan.movies[0].legacyVoteCode, '28');
assert.strictEqual(plan.movies[0].rating, 3);
assert.strictEqual(GDPR.legacyVoteCodeToRating('1'), 1);
assert.strictEqual(GDPR.legacyVoteCodeToRating('27'), 2);
assert.strictEqual(GDPR.legacyVoteCodeToRating('28'), 3);
assert.strictEqual(GDPR.legacyVoteCodeToRating('29'), 4);
assert.strictEqual(GDPR.legacyVoteCodeToRating('3'), 5);
assert(plan.ignoredSensitive.includes('access_token.csv'));
console.log('✓ GDPR parser: serie, episodi, film, preferiti, conversione voti e privacy');
