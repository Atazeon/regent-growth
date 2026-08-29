const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const runbook = fs.readFileSync(path.join(root, "docs", "RUNBOOK.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["runbook has test mailbox section", runbook.includes("## Test-Mailbox Adapter Capture")],
  ["runbook sets provider", runbook.includes('$env:REGENT_EMAIL_PROVIDER="test-mailbox"')],
  ["runbook sets sender", runbook.includes("REGENT_TEST_MAILBOX_SENDER")],
  ["runbook sets address", runbook.includes("REGENT_TEST_MAILBOX_ADDRESS")],
  ["runbook starts middleware", runbook.includes("production-provider-middleware.js")],
  ["runbook mentions sent false", runbook.includes("sent: false")],
  ["runbook lists adapter readiness", runbook.includes("http://127.0.0.1:5195/adapter-readiness")],
  ["runbook lists replay", runbook.includes("POST http://127.0.0.1:5195/replay")],
  ["runbook points to fixture", runbook.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["runbook blocks real recipients", runbook.includes("Do not use a real prospect recipient")],
  ["project plan next test mailbox runbook exists", projectPlan.includes("- First test-mailbox provider adapter runbook")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production test-mailbox runbook test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production test-mailbox runbook test passed.");
