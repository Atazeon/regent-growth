const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const fixturePath = path.join(root, "tests", "fixtures", "production-test-mailbox-mismatch-reviewed-send.json");
const fixture = require("./fixtures/production-test-mailbox-mismatch-reviewed-send.json");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const {
  createTestMailboxSendAdapter,
  createTestMailboxCaptureAuditEntry
} = require("../production-provider-middleware");

async function run() {
  const originalSender = process.env.REGENT_TEST_MAILBOX_SENDER;
  const originalAddress = process.env.REGENT_TEST_MAILBOX_ADDRESS;

  process.env.REGENT_TEST_MAILBOX_SENDER = "sender@example.com";
  process.env.REGENT_TEST_MAILBOX_ADDRESS = "founder@example.com";

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
    ["mismatch fixture file exists", fs.existsSync(fixturePath)],
    ["mismatch fixture uses test mailbox provider", fixture.packet.provider.selectedProvider === "test-mailbox"],
    ["mismatch fixture has wrong sender", fixture.packet.provider.senderEmail === "wrong-sender@example.com"],
    ["mismatch fixture has wrong recipient", fixture.packet.message.to === "wrong-recipient@example.com"],
    ["mismatch fixture rejects", result.accepted === false],
    ["mismatch fixture does not capture", result.captured === false],
    ["mismatch fixture never sends", result.sent === false],
    ["mismatch fixture never books", result.booked === false],
    ["mismatch fixture reports sender mismatch", result.issues.includes("Sender email must match REGENT_TEST_MAILBOX_SENDER.")],
    ["mismatch fixture reports recipient mismatch", result.issues.includes("Recipient email must match REGENT_TEST_MAILBOX_ADDRESS.")],
    ["mismatch audit keeps rejected state", audit.accepted === false && audit.captured === false],
    ["mismatch audit omits body", !serializedAudit.includes(fixture.packet.message.body)],
    ["project plan next mismatch fixture exists", projectPlan.includes("- First test-mailbox provider adapter mismatch fixture")]
  ];

  const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

  if (failures.length) {
    console.error(`Production test-mailbox mismatch fixture test failed: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log("Production test-mailbox mismatch fixture test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
