const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const {
  getGmailReviewedPacketPreflight,
  recordGmailAuditPreviewEntry,
  getGmailSendReadinessSummary
} = require("../production-provider-middleware");

const originalEnv = {
  REGENT_GMAIL_CLIENT_ID: process.env.REGENT_GMAIL_CLIENT_ID,
  REGENT_GMAIL_CLIENT_SECRET: process.env.REGENT_GMAIL_CLIENT_SECRET,
  REGENT_GMAIL_REFRESH_TOKEN: process.env.REGENT_GMAIL_REFRESH_TOKEN,
  REGENT_GMAIL_SEND_ADAPTER_REVIEWED: process.env.REGENT_GMAIL_SEND_ADAPTER_REVIEWED,
  REGENT_GMAIL_SUPPRESSION_REVIEWED: process.env.REGENT_GMAIL_SUPPRESSION_REVIEWED,
  REGENT_GMAIL_UNSUBSCRIBE_REVIEWED: process.env.REGENT_GMAIL_UNSUBSCRIBE_REVIEWED,
  REGENT_GMAIL_AUDIT_REVIEWED: process.env.REGENT_GMAIL_AUDIT_REVIEWED,
  REGENT_GMAIL_RETRY_REVIEWED: process.env.REGENT_GMAIL_RETRY_REVIEWED,
  REGENT_GMAIL_SETUP_APPROVED: process.env.REGENT_GMAIL_SETUP_APPROVED,
  REGENT_SUPPRESSION_EMAILS: process.env.REGENT_SUPPRESSION_EMAILS,
  REGENT_GMAIL_SUPPRESSION_EMAILS: process.env.REGENT_GMAIL_SUPPRESSION_EMAILS
};

for (const key of Object.keys(originalEnv)) {
  delete process.env[key];
}

const missingSummary = getGmailSendReadinessSummary(fixture);
const readyPayload = JSON.parse(JSON.stringify(fixture));
readyPayload.packet.message.body = `${readyPayload.packet.message.body}\n\nReply unsubscribe or opt out and I will not contact you again.`;

process.env.REGENT_GMAIL_CLIENT_ID = "client-id";
process.env.REGENT_GMAIL_CLIENT_SECRET = "client-secret";
process.env.REGENT_GMAIL_REFRESH_TOKEN = "refresh-token";
process.env.REGENT_GMAIL_SEND_ADAPTER_REVIEWED = "true";
process.env.REGENT_GMAIL_SUPPRESSION_REVIEWED = "true";
process.env.REGENT_GMAIL_UNSUBSCRIBE_REVIEWED = "true";
process.env.REGENT_GMAIL_AUDIT_REVIEWED = "true";
process.env.REGENT_GMAIL_RETRY_REVIEWED = "true";
process.env.REGENT_GMAIL_SETUP_APPROVED = "true";
process.env.REGENT_SUPPRESSION_EMAILS = "blocked@example.com";
process.env.REGENT_GMAIL_SUPPRESSION_EMAILS = "other@example.com";

const preflight = getGmailReviewedPacketPreflight(readyPayload);
recordGmailAuditPreviewEntry(readyPayload, preflight);
const readySummary = getGmailSendReadinessSummary(readyPayload);

for (const [key, value] of Object.entries(originalEnv)) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

const checkKeys = readySummary.checks.map((check) => check.key);

const checks = [
  ["middleware exports gmail readiness summary", typeof getGmailSendReadinessSummary === "function"],
  ["middleware has gmail readiness route", source.includes('requestUrl.pathname === "/gmail/send-readiness"')],
  ["readiness summary schema exists", readySummary.schemaVersion === "regent-growth.gmail-send-readiness-summary.v1"],
  ["readiness summary has timestamp", typeof readySummary.generatedAt === "string" && readySummary.generatedAt.length > 0],
  ["readiness summary names provider", readySummary.provider === "gmail"],
  ["readiness summary blocks approval", readySummary.approvedForRealSend === false],
  ["readiness summary blocks canSend", readySummary.canSend === false],
  ["readiness summary keeps sent disabled", readySummary.sentEnabled === false],
  ["readiness summary keeps booked disabled", readySummary.bookedEnabled === false],
  ["readiness summary includes reviewed packet check", checkKeys.includes("reviewed-packet")],
  ["readiness summary includes env check", checkKeys.includes("gmail-env")],
  ["readiness summary includes implementation check", checkKeys.includes("implementation-controls")],
  ["readiness summary includes suppression check", checkKeys.includes("suppression")],
  ["readiness summary includes unsubscribe check", checkKeys.includes("unsubscribe")],
  ["readiness summary includes audit preview check", checkKeys.includes("audit-preview")],
  ["missing summary reports incomplete checks", missingSummary.missingChecks.includes("gmail-env")],
  ["ready summary clears missing checks", readySummary.missingChecks.length === 0],
  ["ready summary is ready for review", readySummary.readyForImplementationReview === true],
  ["ready summary still blocks send approval", readySummary.blockedReasons.includes("Gmail send readiness summary is not send approval.")],
  ["project plan next gmail readiness summary exists", projectPlan.includes("- First Gmail send readiness summary")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail send readiness summary test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail send readiness summary test passed.");
