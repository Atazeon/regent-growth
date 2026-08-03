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
  ["runbook documents production provider setup", runbook.includes("## Production Provider Setup")],
  ["runbook documents email provider env", runbook.includes("REGENT_EMAIL_PROVIDER")],
  ["runbook documents provider check", runbook.includes("Check provider")],
  ["runbook keeps automatic send disabled", runbook.includes("real automatic sending and booking stay disabled")],
  ["runbook documents provider stub dry run", runbook.includes("## Provider Stub Dry Run")],
  ["runbook documents stub file", runbook.includes("production-provider-stub.js")],
  ["runbook documents stub endpoint", runbook.includes("http://127.0.0.1:5194/reviewed-send")],
  ["runbook documents middleware skeleton", runbook.includes("## Middleware Skeleton")],
  ["runbook documents middleware file", runbook.includes("production-provider-middleware.js")],
  ["runbook documents middleware endpoint", runbook.includes("http://127.0.0.1:5195/reviewed-send")],
  ["runbook documents validation", runbook.includes("tests\\run-source-tests.js")],
  ["runbook has troubleshooting", runbook.includes("## Troubleshooting")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance runbook doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance runbook doc test passed.");
