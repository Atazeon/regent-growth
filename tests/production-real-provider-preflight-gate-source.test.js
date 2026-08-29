const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-test-mailbox-reviewed-send.json");
const mismatchFixture = require("./fixtures/production-test-mailbox-mismatch-reviewed-send.json");
const {
  createTestMailboxSendAdapter,
  recordTestMailboxCaptureAuditEntry,
  getRealProviderPreflightGate
} = require("../production-provider-middleware");

async function run() {
  const initialGate = getRealProviderPreflightGate();
  const originalSender = process.env.REGENT_TEST_MAILBOX_SENDER;
  const originalAddress = process.env.REGENT_TEST_MAILBOX_ADDRESS;

  process.env.REGENT_TEST_MAILBOX_SENDER = fixture.packet.provider.senderEmail;
  process.env.REGENT_TEST_MAILBOX_ADDRESS = fixture.packet.message.to;

  const adapter = createTestMailboxSendAdapter();
  const acceptedResult = await adapter.sendReviewedPacket(fixture);
  const rejectedResult = await adapter.sendReviewedPacket(mismatchFixture);
  recordTestMailboxCaptureAuditEntry(fixture, acceptedResult);
  recordTestMailboxCaptureAuditEntry(mismatchFixture, rejectedResult);
  const gate = getRealProviderPreflightGate();

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

  const evidenceKeys = gate.evidence.map((item) => item.key);
  const checks = [
    ["middleware exports real provider preflight gate", typeof getRealProviderPreflightGate === "function"],
    ["middleware has provider preflight route", source.includes('requestUrl.pathname === "/provider-preflight"')],
    ["preflight schema exists", gate.schemaVersion === "regent-growth.real-provider-preflight.v1"],
    ["preflight has timestamp", typeof gate.checkedAt === "string" && gate.checkedAt.length > 0],
    ["preflight blocks real sends", gate.approvedForRealSend === false],
    ["preflight keeps sent disabled", gate.sentEnabled === false],
    ["preflight keeps booked disabled", gate.bookedEnabled === false],
    ["preflight lists real provider candidates", gate.providerCandidates.includes("gmail") && gate.providerCandidates.includes("outlook") && gate.providerCandidates.includes("custom")],
    ["preflight links readiness export", gate.readinessExportEndpoint === "/adapter-readiness/export"],
    ["preflight links run packet", gate.testMailboxRunPacketEndpoint === "/test-mailbox/run-packet"],
    ["preflight links capture export", gate.testMailboxCaptureExportEndpoint === "/test-mailbox/capture/export"],
    ["preflight includes checklist evidence", evidenceKeys.includes("provider-adapter-checklist")],
    ["preflight includes accepted capture evidence", evidenceKeys.includes("test-mailbox-accepted-capture")],
    ["preflight includes rejected capture evidence", evidenceKeys.includes("test-mailbox-rejected-capture")],
    ["preflight includes body storage evidence", evidenceKeys.includes("body-content-not-stored")],
    ["initial preflight reports missing capture evidence", initialGate.missingEvidence.includes("test-mailbox-accepted-capture")],
    ["preflight accepts matching capture evidence", gate.evidence.find((item) => item.key === "test-mailbox-accepted-capture").ready === true],
    ["preflight accepts mismatch rejection evidence", gate.evidence.find((item) => item.key === "test-mailbox-rejected-capture").ready === true],
    ["preflight keeps body content out", gate.evidence.find((item) => item.key === "body-content-not-stored").ready === true],
    ["preflight still blocks skeleton providers", gate.blockedReasons.includes("Real provider adapters remain skeleton-only.")],
    ["project plan next preflight gate exists", projectPlan.includes("- First real provider adapter preflight gate")]
  ];

  const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

  if (failures.length) {
    console.error(`Production real provider preflight gate test failed: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log("Production real provider preflight gate test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
