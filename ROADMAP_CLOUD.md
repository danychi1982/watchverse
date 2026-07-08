# Roadmap cloud di Watchverse

## Già predisposto nella 2.0
- login locale con password PBKDF2 e sessione ricordata;
- alias utente `utente` e email di recupero configurabile;
- login, refresh sessione, cambio password e recupero email tramite Supabase quando configurato;
- schema SQL con Row Level Security;
- profili separati e PIN facoltativi;
- Edge Function TMDB con token server-side;
- PWA pronta per hosting HTTPS.

## Fase successiva
- sincronizzazione incrementale IndexedDB ↔ Supabase per film, serie e 15.000+ episodi;
- risoluzione dei conflitti tra telefono e PC;
- salvataggio cloud di avatar e impostazioni;
- inviti familiari e trasferimento futuro del profilo Elena a un account autonomo;
- notifiche push a browser chiuso e controllo giornaliero delle uscite.
