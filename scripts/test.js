const { spawnSync } = require("node:child_process");

const checks = [
  ["node", ["--check", "app.js"]],
  ["node", ["--check", "auth.js"]],
  ["node", ["--check", "gdpr-import.js"]],
  ["node", ["--check", "public-metadata.js"]],
  ["node", ["--check", "accessibility-report.js"]],
  ["node", ["--check", "sw.js"]],
  ["node", ["tests/test-gdpr-import.js"]],
  ["node", ["tests/test-gdpr-zip.js"]],
  ["node", ["tests/test-password-policy.js"]],
  ["node", ["tests/test-clean-onboarding.js"]],
  ["node", ["tests/test-sorting-performance.js"]],
  ["node", ["tests/test-compact-cards.js"]],
  ["node", ["tests/test-home-metadata-status.js"]],
  ["node", ["tests/test-stats-sections.js"]],
  ["node", ["tests/test-calendar-detail-layout.js"]],
  ["node", ["tests/test-person-schedule.js"]],
  ["node", ["tests/test-trailer.js"]],
  [["python", "py"], ["tests/test-public-sources.py"], ["-3", "tests/test-public-sources.py"]],
  ["node", ["tests/test-appearance-accessibility.js"]],
  ["node", ["tests/test-theme-contrast.js"]],
  ["node", ["tests/test-shared-catalog.js"]],
  ["node", ["tests/test-localized-metadata.js"]],
  ["node", ["tests/test-ui-2.0.18.js"]],
  ["node", ["tests/test-cinema-location-spacing.js"]],
  ["node", ["tests/test-default-sources.js"]],
  ["node", ["tests/test-cloud-sync-contract.js"]],
  ["node", ["tests/test-pin-cloud-contract.js"]],
  ["node", ["tests/test-proxy-contract.js"]],
  ["node", ["tests/test-security-contract.js"]],
  ["node", ["tests/test-library-safety.js"]],
  ["node", ["tests/test-search-results.js"]],
  ["node", ["tests/test-refresh-session.js"]],
  ["node", ["--check", "tests/e2e-browser.js"]],
  ["node", ["tests/test-aivengers-launcher-position.js"]],
  ["node", ["tests/test-metadata-cycle-completion.js"]],
  ["node", ["tests/test-ui-2.0.20.js"]],
  ["node", ["tests/test-ui-2.0.21.js"]],
  ["node", ["tests/test-ui-2.0.22.js"]],
  ["node", ["tests/test-ui-2.0.24.js"]],
  ["node", ["tests/test-ui-2.0.25.js"]],
  ["node", ["tests/test-ui-2.0.27.js"]],
  ["node", ["tests/e2e-empty-home-rail.js"]],
  ["node", ["tests/e2e-home-card-navigation.js"]]
];

const localBrowserBlocked = process.platform === 'win32' && !process.env.CI && !process.env.WATCHVERSE_RUN_E2E && !process.env.WATCHVERSE_CDP_URL && !process.env.CHROME_PATH;
const browserE2EEnabled = process.env.WATCHVERSE_RUN_E2E === '1';

for (const check of checks) {
  const isBrowserE2E = check[1]?.some(arg => String(arg).startsWith('tests/e2e-'));
  if (isBrowserE2E && (!browserE2EEnabled || localBrowserBlocked)) {
    const reason = localBrowserBlocked ? 'Chrome locale bloccato da spawn EPERM' : 'E2E browser opt-in; usa WATCHVERSE_RUN_E2E=1';
    console.log(`> ${check[0]} ${check[1].join(' ')} (saltato: ${reason})`);
    continue;
  }
  const command = Array.isArray(check[0]) ? resolveCommand(check) : check[0];
  const args = Array.isArray(check[0]) ? command.args : check[1];
  const executable = Array.isArray(check[0]) ? command.executable : command;
  const label = `${executable} ${args.join(" ")}`;
  console.log(`> ${label}`);

  const result = spawnSync(executable, args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PYTHONIOENCODING: "utf-8"
    },
    shell: process.platform === "win32",
    stdio: "inherit"
  });

  if (result.error || result.status !== 0) {
    console.error(`Test fallito: ${label}`);
    process.exit(result.status || 1);
  }
}

console.log("Controlli completati");

function resolveCommand([executables, defaultArgs, fallbackArgs]) {
  for (const executable of executables) {
    const result = spawnSync(executable, ["--version"], {
      shell: process.platform === "win32",
      stdio: "ignore"
    });

    if (result.status === 0) {
      return {
        executable,
        args: executable === "py" ? fallbackArgs : defaultArgs
      };
    }
  }

  return {
    executable: executables[0],
    args: defaultArgs
  };
}
