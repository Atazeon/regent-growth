const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_TEST_MAILBOX_RUN_PACKET_EXPORT.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["run packet export doc title exists", doc.includes("# Production Test-Mailbox Run Packet Export")],
  ["run packet export doc documents endpoint", doc.includes("GET http://127.0.0.1:5195/test-mailbox/run-packet")],
  ["run packet export doc names schema", doc.includes("regent-growth.test-mailbox-run-packet.v1")],
  ["run packet export doc names provider", doc.includes("provider` is `test-mailbox")],
  ["run packet export doc names capture mode", doc.includes("mode` is `capture-only")],
  ["run packet export doc keeps sent disabled", doc.includes("sentEnabled` is `false")],
  ["run packet export doc keeps booked disabled", doc.includes("bookedEnabled` is `false")],
  ["run packet export doc mentions sender env", doc.includes("REGENT_TEST_MAILBOX_SENDER")],
  ["run packet export doc mentions address env", doc.includes("REGENT_TEST_MAILBOX_ADDRESS")],
  ["run packet export doc mentions matching fixture", doc.includes("matching fixture")],
  ["run packet export doc mentions mismatch fixture", doc.includes("mismatch fixture")],
  ["run packet export doc mentions body storage check", doc.includes("bodyContentStored is false")],
  ["run packet export doc blocks real sends", doc.includes("Do not use this export as approval")],
  ["project plan next run packet export docs exists", projectPlan.includes("- First test-mailbox provider adapter run packet export docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production test-mailbox run packet export doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production test-mailbox run packet export doc test passed.");
