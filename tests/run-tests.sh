#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node --check app.js
node --check auth.js
node --check gdpr-import.js
node --check public-metadata.js
node --check accessibility-report.js
node --check sw.js
node tests/test-gdpr-import.js
node tests/test-gdpr-zip.js
node tests/test-password-policy.js
node tests/test-clean-onboarding.js
node tests/test-sorting-performance.js
node tests/test-compact-cards.js
node tests/test-home-metadata-status.js
node tests/test-stats-sections.js
node tests/test-calendar-detail-layout.js
node tests/test-person-schedule.js
node tests/test-trailer.js
python tests/test-public-sources.py
node tests/test-appearance-accessibility.js
node tests/test-theme-contrast.js
node tests/test-shared-catalog.js
printf '✓ Controlli sintattici completati\n'
node tests/test-localized-metadata.js
node tests/test-ui-2.0.18.js
node tests/test-cinema-location-spacing.js

node tests/test-default-sources.js

node tests/test-aivengers-launcher-position.js

node tests/test-metadata-cycle-completion.js

node tests/test-ui-2.0.20.js
node tests/test-ui-2.0.21.js

node tests/test-ui-2.0.22.js
node tests/test-ui-2.0.24.js
node tests/test-ui-2.0.25.js

node tests/test-ui-2.0.27.js
