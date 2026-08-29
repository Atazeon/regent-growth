const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getTestMailboxRunPacket } = require("../production-provider-middleware");

const packet = getTestMailboxRunPacket();

const checks = [
  ["middleware exports run packet", typeof getTestMailboxRunPacket === "function"],
  ["middleware has run packet route", source.includes('requestUrl.pathname === "/test-mailbox/run-packet"')],
  ["run packet schema exists", packet.schemaVersion === "regent-growth.test-mailbox-run-packet.v1"],
  ["run packet has timestamp", typeof packet.generatedAt === "string" && packet.generatedAt.length > 0],
  ["run packet uses test mailbox", packet.provider === "test-mailbox"],
  ["run packet is capture only", packet.mode === "capture-only"],
  ["run packet disables send", packet.sentEnabled === false],
  ["run packet disables booking", packet.bookedEnabled === false],
  ["run packet includes status endpoint", packet.statusEndpoint === "/test-mailbox/status"],
  ["run packet includes capture endpoint", packet.captureEndpoint === "/test-mailbox/capture"],
  ["run packet includes capture export endpoint", packet.captureExportEndpoint === "/test-mailbox/capture/export"],
  ["run packet points to replay fixture", packet.replayFixture === "tests/fixtures/production-test-mailbox-reviewed-send.json"],
  ["run packet points to mismatch fixture", packet.mismatchFixture === "tests/fixtures/production-test-mailbox-mismatch-reviewed-send.json"],
  ["run packet includes status", packet.status && packet.status.schemaVersion === "regent-growth.test-mailbox-status.v1"],
  ["run packet includes required steps", Array.isArray(packet.requiredSteps) && packet.requiredSteps.length >= 5],
  ["run packet requires body storage check", packet.requiredSteps.some((step) => step.includes("bodyContentStored is false"))],
  ["project plan next run packet exists", projectPlan.includes("- First test-mailbox provider adapter run packet")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production test-mailbox run packet test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production test-mailbox run packet test passed.");
