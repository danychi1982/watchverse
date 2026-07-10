const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const entries = [
  "index.html",
  "version.js",
  "detail-preview.html",
  "layout-preview.html",
  "manuale_watchverse.html",
  "manifest.webmanifest",
  "sw.js",
  "app.js",
  "auth.js",
  "cloud-sync.js",
  "config.js",
  "gdpr-import.js",
  "public-metadata.js",
  "accessibility-report.js",
  "styles.css",
  "assets"
];

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function removeDist() {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      if (fs.existsSync(dist)) {
        fs.chmodSync(dist, 0o777);
      }
      fs.rmSync(dist, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === 5) {
        throw error;
      }
      sleep(150 * attempt);
    }
  }
}

function copyEntry(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(dist, relativePath);

  if (!fs.existsSync(source)) {
    throw new Error(`File o cartella mancante: ${relativePath}`);
  }

  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.cpSync(source, target, { recursive: true });
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function writeBuildInfo() {
  const info = {
    name: "watchverse",
    version: readVersion(),
    builtAt: new Date().toISOString(),
    files: entries
  };

  fs.writeFileSync(
    path.join(dist, "build-info.json"),
    `${JSON.stringify(info, null, 2)}\n`,
    "utf8"
  );
}

function writeVersionAsset() {
  fs.writeFileSync(
    path.join(dist, "version.js"),
    `window.WATCHVERSE_VERSION = ${JSON.stringify(readVersion())};\n`,
    "utf8"
  );
  const serviceWorker = path.join(dist, "sw.js");
  fs.writeFileSync(
    serviceWorker,
    fs.readFileSync(serviceWorker, "utf8").replaceAll("__VERSION__", readVersion()),
    "utf8"
  );
}

function writePagesFiles() {
  fs.writeFileSync(path.join(dist, ".nojekyll"), "", "utf8");
  fs.copyFileSync(path.join(dist, "index.html"), path.join(dist, "404.html"));
}

function readVersion() {
  const versionFile = path.join(root, "VERSION.txt");
  if (!fs.existsSync(versionFile)) {
    return "unknown";
  }
  return fs.readFileSync(versionFile, "utf8").trim() || "unknown";
}

removeDist();
fs.mkdirSync(dist, { recursive: true });

for (const entry of entries) {
  copyEntry(entry);
}

writeBuildInfo();
writeVersionAsset();
writePagesFiles();

console.log(`Build completata in ${path.relative(root, dist)}`);
