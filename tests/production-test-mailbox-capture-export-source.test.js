const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-test-mailbox-reviewed-send.json");
const {
  createTestMailboxSendAdapter,
  recordTestMailboxCaptureAuditEntry,
  getTestMailboxCaptureAuditExport
} = require("../production-provider-middleware");

async function run() {
  const originalSender = process.env.REGENT_TEST_MAILBOX_SENDER;
  const originalAddress = process.env.REGENT_TEST_MAILBOX_ADDRESS;

  process.env.REGENT_TEST_MAILBOX_SENDER = fixture.packet.provider.senderEmail;
  process.env.REGENT_TEST_MAILBOX_ADDRESS = fixture.packet.message.to;

  const result = await createTestMailboxSendAdapter().sendReviewedPacket(fixture);
  recordTestMailboxCaptureAuditEntry(fixture, result);
  const captureExport = getTestMailboxCaptureAuditExport();

  if (originalSender === undefined) {
    delete process.env.REGENT_TEST_MAILBOX_SENDER;
  } else {
    process.env.REGENT_TEST_MAILBOX_SENDER = originalSender;
  }

  if (originalAddress === undefined) {
    delete process.env.REGENT_TEST_MAILBOX_ADDRESS;
  } else {
    process.env.REGENT_TEST_MAILBOX_ADDRESS = originalAddress;
  }

  const serializedExport = JSON.stringify(captureExport);
  const checks = [
    ["middleware exports capture export", typeof getTestMailboxCaptureAuditExport === "function"],
    ["middleware has capture export route", source.includes('requestUrl.pathname === "/test-mailbox/capture/export"')],
    ["capture export schema exists", captureExport.schemaVersion === "regent-growth.test-mailbox-capture-audit.v1"],
    ["capture export has timestamp", typeof captureExport.generatedAt === "string" && captureExport.generatedAt.length > 0],
    ["capture export states no body storage", captureExport.bodyContentStored === false],
    ["capture export has entries", Array.isArray(captureExport.entries) && captureExport.entries.length > 0],
    ["capture export summary counts total", captureExport.summary.total === captureExport.entries.length],
    ["capture export summary counts accepted", captureExport.summary.accepted >= 1],
    ["capture export summary counts captured", captureExport.summary.captured >= 1],
    ["capture export summary keeps sent zero", captureExport.summary.sent === 0],
    ["capture export summary keeps booked zero", captureExport.summary.booked === 0],
    ["capture export omits body content", !serializedExport.includes(fixture.packet.message.body)],
    ["project plan next capture export exists", projectPlan.includes("- First test-mailbox provider adapter capture export")]
  ];

  const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

  if (failures.length) {
    console.error(`Production test-mailbox capture export test failed: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log("Production test-mailbox capture export test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
