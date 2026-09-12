const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const {
  getOutlookReviewedPacketPreflight,
  recordOutlookAuditPreviewEntry,
  getOutlookSendReadinessSummary
} = require("../production-provider-middleware");

const originalEnv = {
  REGENT_OUTLOOK_CLIENT_ID: process.env.REGENT_OUTLOOK_CLIENT_ID,
  REGENT_OUTLOOK_CLIENT_SECRET: process.env.REGENT_OUTLOOK_CLIENT_SECRET,
  REGENT_OUTLOOK_TENANT_ID: process.env.REGENT_OUTLOOK_TENANT_ID,
  REGENT_OUTLOOK_REFRESH_TOKEN: process.env.REGENT_OUTLOOK_REFRESH_TOKEN,
  REGENT_OUTLOOK_SEND_ADAPTER_REVIEWED: process.env.REGENT_OUTLOOK_SEND_ADAPTER_REVIEWED,
  REGENT_OUTLOOK_SUPPRESSION_REVIEWED: process.env.REGENT_OUTLOOK_SUPPRESSION_REVIEWED,
  REGENT_OUTLOOK_UNSUBSCRIBE_REVIEWED: process.env.REGENT_OUTLOOK_UNSUBSCRIBE_REVIEWED,
  REGENT_OUTLOOK_AUDIT_REVIEWED: process.env.REGENT_OUTLOOK_AUDIT_REVIEWED,
  REGENT_OUTLOOK_RETRY_REVIEWED: process.env.REGENT_OUTLOOK_RETRY_REVIEWED,
  REGENT_OUTLOOK_SETUP_APPROVED: process.env.REGENT_OUTLOOK_SETUP_APPROVED,
  REGENT_SUPPRESSION_EMAILS: process.env.REGENT_SUPPRESSION_EMAILS,
  REGENT_OUTLOOK_SUPPRESSION_EMAILS: process.env.REGENT_OUTLOOK_SUPPRESSION_EMAILS
};

for (const key of Object.keys(originalEnv)) {
  delete process.env[key];
}

const missingSummary = getOutlookSendReadinessSummary(fixture);
const readyPayload = JSON.parse(JSON.stringify(fixture));
readyPayload.packet.message.body = `${readyPayload.packet.message.body}\n\nReply unsubscribe or opt out and I will not contact you again.`;

process.env.REGENT_OUTLOOK_CLIENT_ID = "client-id";
process.env.REGENT_OUTLOOK_CLIENT_SECRET = "client-secret";
process.env.REGENT_OUTLOOK_TENANT_ID = "tenant-id";
process.env.REGENT_OUTLOOK_REFRESH_TOKEN = "refresh-token";
process.env.REGENT_OUTLOOK_SEND_ADAPTER_REVIEWED = "true";
process.env.REGENT_OUTLOOK_SUPPRESSION_REVIEWED = "true";
process.env.REGENT_OUTLOOK_UNSUBSCRIBE_REVIEWED = "true";
process.env.REGENT_OUTLOOK_AUDIT_REVIEWED = "true";
process.env.REGENT_OUTLOOK_RETRY_REVIEWED = "true";
process.env.REGENT_OUTLOOK_SETUP_APPROVED = "true";
process.env.REGENT_SUPPRESSION_EMAILS = "blocked@example.com";
process.env.REGENT_OUTLOOK_SUPPRESSION_EMAILS = "other@example.com";

const preflight = getOutlookReviewedPacketPreflight(readyPayload);
recordOutlookAuditPreviewEntry(readyPayload, preflight);
const readySummary = getOutlookSendReadinessSummary(readyPayload);

for (const [key, value] of Object.entries(originalEnv)) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

const checkKeys = readySummary.checks.map((check) => check.key);

const checks = [
  ["middleware exports outlook readiness summary", typeof getOutlookSendReadinessSummary === "function"],
  ["middleware has outlook readiness route", source.includes('requestUrl.pathname === "/outlook/send-readiness"')],
  ["readiness summary schema exists", readySummary.schemaVersion === "regent-growth.outlook-send-readiness-summary.v1"],
  ["readiness summary has timestamp", typeof readySummary.generatedAt === "string" && readySummary.generatedAt.length > 0],
  ["readiness summary names provider", readySummary.provider === "outlook"],
  ["readiness summary blocks approval", readySummary.approvedForRealSend === false],
  ["readiness summary blocks canSend", readySummary.canSend === false],
  ["readiness summary keeps sent disabled", readySummary.sentEnabled === false],
  ["readiness summary keeps booked disabled", readySummary.bookedEnabled === false],
  ["readiness summary includes reviewed packet check", checkKeys.includes("reviewed-packet")],
  ["readiness summary includes env check", checkKeys.includes("outlook-env")],
  ["readiness summary includes implementation check", checkKeys.includes("implementation-controls")],
  ["readiness summary includes suppression check", checkKeys.includes("suppression")],
  ["readiness summary includes unsubscribe check", checkKeys.includes("unsubscribe")],
  ["readiness summary includes audit preview check", checkKeys.includes("audit-preview")],
  ["missing summary reports incomplete checks", missingSummary.missingChecks.includes("outlook-env")],
  ["ready summary clears missing checks", readySummary.missingChecks.length === 0],
  ["ready summary is ready for review", readySummary.readyForImplementationReview === true],
  ["ready summary still blocks send approval", readySummary.blockedReasons.includes("Outlook send readiness summary is not send approval.")],
  ["project plan next outlook readiness summary exists", projectPlan.includes("- First Outlook send readiness summary")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook send readiness summary test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook send readiness summary test passed.");
