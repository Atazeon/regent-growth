const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_TEST_MAILBOX_STATUS.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["status doc title exists", doc.includes("# Production Test-Mailbox Status")],
  ["status doc documents endpoint", doc.includes("GET http://127.0.0.1:5195/test-mailbox/status")],
  ["status doc lists sender env", doc.includes("REGENT_TEST_MAILBOX_SENDER")],
  ["status doc lists address env", doc.includes("REGENT_TEST_MAILBOX_ADDRESS")],
  ["status doc explains configured", doc.includes("`configured: true`")],
  ["status doc explains missing env", doc.includes("`missingEnv`")],
  ["status doc keeps can send false", doc.includes("`canSend: false`")],
  ["status doc keeps sent disabled", doc.includes("`sentEnabled: false`")],
  ["status doc keeps booked disabled", doc.includes("`bookedEnabled: false`")],
  ["status doc blocks real providers", doc.includes("not approval to enable Gmail, Outlook, or custom provider sending")],
  ["project plan next status docs exists", projectPlan.includes("- First test-mailbox provider adapter status docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production test-mailbox status doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production test-mailbox status doc test passed.");
