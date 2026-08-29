const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const valid = require("./fixtures/production-reviewed-send-valid.json");
const {
  getProviderAdapter,
  getAdapterGuardrails,
  createProviderSendAdapter,
  createTestMailboxSendAdapter
} = require("../production-provider-middleware");

async function run() {
  const originalSender = process.env.REGENT_TEST_MAILBOX_SENDER;
  const originalAddress = process.env.REGENT_TEST_MAILBOX_ADDRESS;

  process.env.REGENT_TEST_MAILBOX_SENDER = valid.packet.provider.senderEmail;
  process.env.REGENT_TEST_MAILBOX_ADDRESS = valid.packet.message.to;

  const adapter = getProviderAdapter("test-mailbox");
  const guardrails = getAdapterGuardrails(adapter);
  const directTestMailbox = createTestMailboxSendAdapter(adapter);
  const routedTestMailbox = createProviderSendAdapter(adapter);
  const captured = await directTestMailbox.sendReviewedPacket(valid);

  process.env.REGENT_TEST_MAILBOX_ADDRESS = "other@example.com";
  const rejected = await directTestMailbox.sendReviewedPacket(valid);

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
    ["middleware has test mailbox adapter", source.includes('"test-mailbox": {')],
    ["test mailbox adapter exports direct factory", typeof createTestMailboxSendAdapter === "function"],
    ["test mailbox adapter has sender env", adapter.requiredEnv.includes("REGENT_TEST_MAILBOX_SENDER")],
    ["test mailbox adapter has recipient env", adapter.requiredEnv.includes("REGENT_TEST_MAILBOX_ADDRESS")],
    ["test mailbox adapter cannot send", adapter.canSend === false],
    ["test mailbox guardrails see configured env", guardrails.missingEnv.length === 0],
    ["provider send factory routes test mailbox", routedTestMailbox.provider === "test-mailbox"],
    ["test mailbox capture accepts valid fixture", captured.accepted === true],
    ["test mailbox capture marks captured", captured.captured === true],
    ["test mailbox capture never sends", captured.sent === false],
    ["test mailbox capture never books", captured.booked === false],
    ["test mailbox capture has no provider id", captured.providerMessageId === ""],
    ["test mailbox rejects wrong recipient", rejected.accepted === false],
    ["test mailbox explains recipient mismatch", rejected.issues.includes("Recipient email must match REGENT_TEST_MAILBOX_ADDRESS.")],
    ["project plan next test mailbox implementation exists", projectPlan.includes("- First test-mailbox provider adapter implementation")]
  ];

  const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

  if (failures.length) {
    console.error(`Production test-mailbox adapter test failed: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log("Production test-mailbox adapter test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
