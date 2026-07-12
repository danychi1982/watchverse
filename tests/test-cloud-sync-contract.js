const fs = require('node:fs');
const cloud = fs.readFileSync('cloud-sync.js', 'utf8');
const schema = fs.readFileSync('supabase/schema.sql', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20260712_bidirectional_sync.sql', 'utf8');
const cleanupMigration = fs.readFileSync('supabase/migrations/20260712_profile_cleanup_rls.sql', 'utf8');

for (const source of [schema, migration]) {
  for (const token of ['revision', 'deleted_at', 'updated_at', 'library_records_sync_key', 'episode_progress_sync_key']) {
    if (!source.includes(token)) throw new Error(`Schema sync incompleto: ${token}`);
  }
}
for (const token of ['remotePath', 'localWins', 'recordConflict', 'cloud_won', 'on_conflict=profile_id,kind,local_id', 'clearProfileData', 'rpc/clear_profile_data', 'Impossibile svuotare i dati cloud']) {
  if (!cloud.includes(token)) throw new Error(`Contratto sync incompleto: ${token}`);
}
if (!cleanupMigration.includes('clear_profile_data') || !cleanupMigration.includes('security definer')) {
  throw new Error('Migration cleanup cloud incompleta');
}
console.log('Contratto sincronizzazione bidirezionale verificato');
