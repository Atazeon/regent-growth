const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_TEST_MAILBOX_MISMATCH.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["mismatch doc title exists", doc.includes("# Production Test-Mailbox Mismatch")],
  ["mismatch doc points to fixture", doc.includes("tests/fixtures/production-test-mailbox-mismatch-reviewed-send.json")],
  ["mismatch doc names wrong sender", doc.includes("wrong-sender@example.com")],
  ["mismatch doc names wrong recipient", doc.includes("wrong-recipient@example.com")],
  ["mismatch doc sets provider env", doc.includes('$env:REGENT_EMAIL_PROVIDER="test-mailbox"')],
  ["mismatch doc sets sender env", doc.includes("REGENT_TEST_MAILBOX_SENDER")],
  ["mismatch doc sets address env", doc.includes("REGENT_TEST_MAILBOX_ADDRESS")],
  ["mismatch doc expects rejection", doc.includes("`accepted: false`")],
  ["mismatch doc expects uncaptured", doc.includes("`captured: false`")],
  ["mismatch doc expects sent false", doc.includes("`sent: false`")],
  ["mismatch doc expects booked false", doc.includes("`booked: false`")],
  ["mismatch doc includes sender issue", doc.includes("Sender email must match REGENT_TEST_MAILBOX_SENDER.")],
  ["mismatch doc includes recipient issue", doc.includes("Recipient email must match REGENT_TEST_MAILBOX_ADDRESS.")],
  ["mismatch doc blocks body storage", doc.includes("must not store the message body")],
  ["project plan next mismatch docs exists", projectPlan.includes("- First test-mailbox provider adapter mismatch docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production test-mailbox mismatch doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production test-mailbox mismatch doc test passed.");
