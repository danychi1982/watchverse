const { spawnSync, spawn } = require("node:child_process");

const candidates = process.platform === "win32"
  ? [
      { executable: "py", args: ["-3", "avvia_server.py"] },
      { executable: "python", args: ["avvia_server.py"] }
    ]
  : [
      { executable: "python3", args: ["avvia_server.py"] },
      { executable: "python", args: ["avvia_server.py"] }
    ];

const candidate = candidates.find(({ executable }) => {
  const result = spawnSync(executable, ["--version"], {
    shell: process.platform === "win32",
    stdio: "ignore"
  });
  return result.status === 0;
});

if (!candidate) {
  console.error("Python 3 non trovato. Installa Python 3 o aggiungilo al PATH.");
  process.exit(1);
}

const child = spawn(candidate.executable, candidate.args, {
  cwd: process.cwd(),
  shell: process.platform === "win32",
  stdio: "inherit"
});

child.on("exit", (code) => {
  process.exit(code || 0);
});

