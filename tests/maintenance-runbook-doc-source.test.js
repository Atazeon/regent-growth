const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const runbook = fs.readFileSync(path.join(root, "docs", "RUNBOOK.md"), "utf8");

const checks = [
  ["runbook title exists", runbook.includes("# Regent Growth Runbook")],
  ["runbook documents Ollama start", runbook.includes("ollama run qwen3:8b")],
  ["runbook documents server command", runbook.includes("local-research-server.js")],
  ["runbook documents local URL", runbook.includes("http://127.0.0.1:5193/index.html")],
  ["runbook has smoke check", runbook.includes("## Smoke Check")],
  ["runbook documents validation", runbook.includes("tests\\run-source-tests.js")],
  ["runbook has troubleshooting", runbook.includes("## Troubleshooting")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance runbook doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance runbook doc test passed.");
