const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_TEST_MAILBOX_RUN_PACKET.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["run packet doc title exists", doc.includes("# Production Test-Mailbox Run Packet")],
  ["run packet doc documents endpoint", doc.includes("GET http://127.0.0.1:5195/test-mailbox/run-packet")],
  ["run packet doc names schema", doc.includes("regent-growth.test-mailbox-run-packet.v1")],
  ["run packet doc names provider", doc.includes("provider: `test-mailbox`")],
  ["run packet doc names capture mode", doc.includes("mode: `capture-only`")],
  ["run packet doc keeps send disabled", doc.includes("send enabled: `false`")],
  ["run packet doc keeps booking disabled", doc.includes("booking enabled: `false`")],
  ["run packet doc lists status endpoint", doc.includes("/test-mailbox/status")],
  ["run packet doc lists capture endpoint", doc.includes("/test-mailbox/capture")],
  ["run packet doc lists capture export", doc.includes("/test-mailbox/capture/export")],
  ["run packet doc lists replay fixture", doc.includes("tests/fixtures/production-test-mailbox-reviewed-send.json")],
  ["run packet doc lists mismatch fixture", doc.includes("tests/fixtures/production-test-mailbox-mismatch-reviewed-send.json")],
  ["run packet doc checks body storage", doc.includes("bodyContentStored: false")],
  ["project plan next run packet docs exists", projectPlan.includes("- First test-mailbox provider adapter run packet docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production test-mailbox run packet doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production test-mailbox run packet doc test passed.");
