const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const fixturePath = path.join(root, "tests", "fixtures", "production-test-mailbox-reviewed-send.json");
const fixture = require("./fixtures/production-test-mailbox-reviewed-send.json");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const {
  createTestMailboxSendAdapter,
  replayMiddlewareFixture,
  getMiddlewareReplayExport
} = require("../production-provider-middleware");

async function run() {
  const originalSender = process.env.REGENT_TEST_MAILBOX_SENDER;
  const originalAddress = process.env.REGENT_TEST_MAILBOX_ADDRESS;

  process.env.REGENT_TEST_MAILBOX_SENDER = fixture.packet.provider.senderEmail;
  process.env.REGENT_TEST_MAILBOX_ADDRESS = fixture.packet.message.to;

  const adapter = createTestMailboxSendAdapter();
  const captured = await adapter.sendReviewedPacket(fixture);
  const replay = replayMiddlewareFixture(fixture);
  const replayExport = getMiddlewareReplayExport(fixture);

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

  const serializedReplayExport = JSON.stringify(replayExport);
  const checks = [
    ["test mailbox fixture file exists", fs.existsSync(fixturePath)],
    ["fixture uses test mailbox provider", fixture.packet.provider.selectedProvider === "test-mailbox"],
    ["fixture disables automation", fixture.packet.automationAllowed === false],
    ["fixture requires human review", fixture.packet.safety.humanReviewRequired === true],
    ["fixture requires compliance review", fixture.packet.safety.complianceReviewRequired === true],
    ["test mailbox adapter captures fixture", captured.accepted === true && captured.captured === true],
    ["test mailbox adapter still does not send", captured.sent === false && captured.booked === false],
    ["middleware replay accepts fixture shape", replay.replay === true && replay.sent === false],
    ["middleware replay export has schema", replayExport.schemaVersion === "regent-growth.middleware-replay.v1"],
    ["middleware replay export omits body", !serializedReplayExport.includes(fixture.packet.message.body)],
    ["project plan next test mailbox replay fixture exists", projectPlan.includes("- First test-mailbox provider adapter replay fixture")]
  ];

  const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

  if (failures.length) {
    console.error(`Production test-mailbox replay fixture test failed: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log("Production test-mailbox replay fixture test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
