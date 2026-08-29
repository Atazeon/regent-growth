const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_TEST_MAILBOX_CAPTURE.md"), "utf8");
const runbook = fs.readFileSync(path.join(root, "docs", "RUNBOOK.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["capture doc title exists", doc.includes("# Production Test-Mailbox Capture")],
  ["capture doc documents endpoint", doc.includes("POST http://127.0.0.1:5195/test-mailbox/capture")],
  ["capture doc points to fixture", doc.includes("tests/fixtures/production-test-mailbox-reviewed-send.json")],
  ["capture doc sets provider env", doc.includes('$env:REGENT_EMAIL_PROVIDER="test-mailbox"')],
  ["capture doc sets sender env", doc.includes("REGENT_TEST_MAILBOX_SENDER")],
  ["capture doc sets address env", doc.includes("REGENT_TEST_MAILBOX_ADDRESS")],
  ["capture doc expects accepted", doc.includes("`accepted: true`")],
  ["capture doc expects captured", doc.includes("`captured: true`")],
  ["capture doc expects sent false", doc.includes("`sent: false`")],
  ["capture doc expects booked false", doc.includes("`booked: false`")],
  ["capture doc documents export endpoint", doc.includes("GET http://127.0.0.1:5195/test-mailbox/capture/export")],
  ["capture doc mentions export schema", doc.includes("regent-growth.test-mailbox-capture-audit.v1")],
  ["capture doc blocks body storage", doc.includes("does not store message body content")],
  ["runbook has capture section", runbook.includes("## Test-Mailbox Adapter Capture")],
  ["project plan next capture docs exists", projectPlan.includes("- First test-mailbox provider adapter capture docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production test-mailbox capture doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production test-mailbox capture doc test passed.");
