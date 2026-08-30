const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const { getGmailReviewedPacketPreflight } = require("../production-provider-middleware");

const originalEnv = {
  REGENT_GMAIL_CLIENT_ID: process.env.REGENT_GMAIL_CLIENT_ID,
  REGENT_GMAIL_CLIENT_SECRET: process.env.REGENT_GMAIL_CLIENT_SECRET,
  REGENT_GMAIL_REFRESH_TOKEN: process.env.REGENT_GMAIL_REFRESH_TOKEN,
  REGENT_GMAIL_SEND_ADAPTER_REVIEWED: process.env.REGENT_GMAIL_SEND_ADAPTER_REVIEWED,
  REGENT_GMAIL_SUPPRESSION_REVIEWED: process.env.REGENT_GMAIL_SUPPRESSION_REVIEWED,
  REGENT_GMAIL_UNSUBSCRIBE_REVIEWED: process.env.REGENT_GMAIL_UNSUBSCRIBE_REVIEWED,
  REGENT_GMAIL_AUDIT_REVIEWED: process.env.REGENT_GMAIL_AUDIT_REVIEWED,
  REGENT_GMAIL_RETRY_REVIEWED: process.env.REGENT_GMAIL_RETRY_REVIEWED,
  REGENT_GMAIL_SETUP_APPROVED: process.env.REGENT_GMAIL_SETUP_APPROVED
};

for (const key of Object.keys(originalEnv)) {
  delete process.env[key];
}

const blockedPreflight = getGmailReviewedPacketPreflight(fixture);

for (const key of Object.keys(originalEnv)) {
  process.env[key] = "true";
}
process.env.REGENT_GMAIL_CLIENT_ID = "client-id";
process.env.REGENT_GMAIL_CLIENT_SECRET = "client-secret";
process.env.REGENT_GMAIL_REFRESH_TOKEN = "refresh-token";

const reviewedPreflight = getGmailReviewedPacketPreflight(fixture);

for (const [key, value] of Object.entries(originalEnv)) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

const checks = [
  ["middleware exports gmail preflight", typeof getGmailReviewedPacketPreflight === "function"],
  ["middleware has gmail preflight route", source.includes('requestUrl.pathname === "/gmail/preflight"')],
  ["preflight schema exists", reviewedPreflight.schemaVersion === "regent-growth.gmail-reviewed-packet-preflight.v1"],
  ["preflight has timestamp", typeof reviewedPreflight.checkedAt === "string" && reviewedPreflight.checkedAt.length > 0],
  ["preflight names provider", reviewedPreflight.provider === "gmail"],
  ["preflight keeps accepted false", reviewedPreflight.accepted === false],
  ["preflight keeps canSend false", reviewedPreflight.canSend === false],
  ["preflight keeps sent disabled", reviewedPreflight.sentEnabled === false],
  ["preflight keeps booked disabled", reviewedPreflight.bookedEnabled === false],
  ["blocked preflight reports env missing", blockedPreflight.envConfigured === false],
  ["blocked preflight reports implementation missing", blockedPreflight.implementationReady === false],
  ["blocked preflight reports issues", blockedPreflight.issues.some((issue) => issue.includes("REGENT_GMAIL_CLIENT_ID"))],
  ["reviewed preflight validates packet", reviewedPreflight.reviewedPacketValid === true],
  ["reviewed preflight reports env configured", reviewedPreflight.envConfigured === true],
  ["reviewed preflight reports implementation ready", reviewedPreflight.implementationReady === true],
  ["reviewed preflight still blocks sending", reviewedPreflight.blockedReasons.includes("Real Gmail sending is not implemented.")],
  ["preflight links gmail status", reviewedPreflight.envStatusEndpoint === "/gmail/status"],
  ["preflight links implementation guard", reviewedPreflight.implementationGuardEndpoint === "/provider-implementation-guard?provider=gmail"],
  ["project plan next gmail preflight exists", projectPlan.includes("- First Gmail reviewed packet preflight")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail reviewed packet preflight test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail reviewed packet preflight test passed.");
