const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_TEST_MAILBOX_REPLAY.md"), "utf8");
const runbook = fs.readFileSync(path.join(root, "docs", "RUNBOOK.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["replay doc title exists", doc.includes("# Production Test-Mailbox Replay")],
  ["replay doc points to fixture", doc.includes("tests/fixtures/production-test-mailbox-reviewed-send.json")],
  ["replay doc names provider", doc.includes("provider: `test-mailbox`")],
  ["replay doc names sender", doc.includes("sender@example.com")],
  ["replay doc names recipient", doc.includes("founder@example.com")],
  ["replay doc sets provider env", doc.includes('$env:REGENT_EMAIL_PROVIDER="test-mailbox"')],
  ["replay doc sets sender env", doc.includes("REGENT_TEST_MAILBOX_SENDER")],
  ["replay doc sets address env", doc.includes("REGENT_TEST_MAILBOX_ADDRESS")],
  ["replay doc expects accepted", doc.includes("`accepted: true`")],
  ["replay doc expects captured", doc.includes("`captured: true`")],
  ["replay doc expects sent false", doc.includes("`sent: false`")],
  ["replay doc expects booked false", doc.includes("`booked: false`")],
  ["replay doc rejects mismatch", doc.includes("sender or recipient does not match")],
  ["runbook mentions replay fixture", runbook.includes("tests/fixtures/production-reviewed-send-valid.json")],
  ["project plan next replay docs exists", projectPlan.includes("- First test-mailbox provider adapter replay docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production test-mailbox replay doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production test-mailbox replay doc test passed.");
