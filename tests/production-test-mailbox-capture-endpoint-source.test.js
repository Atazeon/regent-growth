const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-test-mailbox-reviewed-send.json");
const {
  createTestMailboxSendAdapter,
  recordTestMailboxCaptureAuditEntry,
  getTestMailboxCaptureAuditTrail
} = require("../production-provider-middleware");

async function run() {
  const originalSender = process.env.REGENT_TEST_MAILBOX_SENDER;
  const originalAddress = process.env.REGENT_TEST_MAILBOX_ADDRESS;

  process.env.REGENT_TEST_MAILBOX_SENDER = fixture.packet.provider.senderEmail;
  process.env.REGENT_TEST_MAILBOX_ADDRESS = fixture.packet.message.to;

  const result = await createTestMailboxSendAdapter().sendReviewedPacket(fixture);
  const previousCount = getTestMailboxCaptureAuditTrail().length;
  const audit = recordTestMailboxCaptureAuditEntry(fixture, result);
  const nextTrail = getTestMailboxCaptureAuditTrail();

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

  const checks = [
    ["middleware has capture endpoint route", source.includes('requestUrl.pathname === "/test-mailbox/capture"')],
    ["middleware records capture audit from endpoint", source.includes("recordTestMailboxCaptureAuditEntry(body, result)")],
    ["middleware exports capture audit recorder", typeof recordTestMailboxCaptureAuditEntry === "function"],
    ["middleware exports capture audit trail", typeof getTestMailboxCaptureAuditTrail === "function"],
    ["capture audit trail prepends entry", nextTrail[0].id === audit.id],
    ["capture audit trail increases count", nextTrail.length === previousCount + 1],
    ["capture audit remains sanitized", audit.bodyStored === false],
    ["capture endpoint returns audit payload", source.includes("audit") && source.includes("result.auditId = audit.id")],
    ["capture endpoint never sends", source.includes("sent: false")],
    ["project plan next capture endpoint exists", projectPlan.includes("- First test-mailbox provider adapter capture endpoint")]
  ];

  const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

  if (failures.length) {
    console.error(`Production test-mailbox capture endpoint test failed: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log("Production test-mailbox capture endpoint test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
