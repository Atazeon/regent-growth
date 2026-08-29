const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-test-mailbox-reviewed-send.json");
const {
  createTestMailboxSendAdapter,
  createTestMailboxCaptureAuditEntry
} = require("../production-provider-middleware");

async function run() {
  const originalSender = process.env.REGENT_TEST_MAILBOX_SENDER;
  const originalAddress = process.env.REGENT_TEST_MAILBOX_ADDRESS;

  process.env.REGENT_TEST_MAILBOX_SENDER = fixture.packet.provider.senderEmail;
  process.env.REGENT_TEST_MAILBOX_ADDRESS = fixture.packet.message.to;

  const result = await createTestMailboxSendAdapter().sendReviewedPacket(fixture);
  const audit = createTestMailboxCaptureAuditEntry(fixture, result);

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

  const serializedAudit = JSON.stringify(audit);
  const checks = [
    ["middleware exports capture audit helper", typeof createTestMailboxCaptureAuditEntry === "function"],
    ["middleware has capture audit action", source.includes('action: "test-mailbox-capture"')],
    ["capture audit uses test mailbox provider", audit.provider === "test-mailbox"],
    ["capture audit keeps accepted", audit.accepted === true],
    ["capture audit keeps captured", audit.captured === true],
    ["capture audit never sends", audit.sent === false],
    ["capture audit never books", audit.booked === false],
    ["capture audit keeps sender", audit.senderEmail === fixture.packet.provider.senderEmail],
    ["capture audit keeps recipient", audit.recipientEmail === fixture.packet.message.to],
    ["capture audit tracks subject presence", audit.subjectPresent === true],
    ["capture audit omits body storage", audit.bodyStored === false],
    ["capture audit omits body content", !serializedAudit.includes(fixture.packet.message.body)],
    ["capture audit keeps issue count", audit.issueCount === result.issues.length],
    ["project plan next capture audit exists", projectPlan.includes("- First test-mailbox provider adapter capture audit")]
  ];

  const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

  if (failures.length) {
    console.error(`Production test-mailbox capture audit test failed: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log("Production test-mailbox capture audit test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
