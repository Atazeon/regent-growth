const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const fixture = require("./fixtures/production-reviewed-send-valid.json");
const { getOutlookReviewedPacketPreflight } = require("../production-provider-middleware");

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
  REGENT_OUTLOOK_SETUP_APPROVED: process.env.REGENT_OUTLOOK_SETUP_APPROVED
};

for (const key of Object.keys(originalEnv)) {
  delete process.env[key];
}

const blockedPreflight = getOutlookReviewedPacketPreflight(fixture);

for (const key of Object.keys(originalEnv)) {
  process.env[key] = "true";
}
process.env.REGENT_OUTLOOK_CLIENT_ID = "client-id";
process.env.REGENT_OUTLOOK_CLIENT_SECRET = "client-secret";
process.env.REGENT_OUTLOOK_TENANT_ID = "tenant-id";
process.env.REGENT_OUTLOOK_REFRESH_TOKEN = "refresh-token";

const reviewedPreflight = getOutlookReviewedPacketPreflight(fixture);

for (const [key, value] of Object.entries(originalEnv)) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

const checks = [
  ["middleware exports outlook preflight", typeof getOutlookReviewedPacketPreflight === "function"],
  ["middleware has outlook preflight route", source.includes('requestUrl.pathname === "/outlook/preflight"')],
  ["preflight schema exists", reviewedPreflight.schemaVersion === "regent-growth.outlook-reviewed-packet-preflight.v1"],
  ["preflight has timestamp", typeof reviewedPreflight.checkedAt === "string" && reviewedPreflight.checkedAt.length > 0],
  ["preflight names provider", reviewedPreflight.provider === "outlook"],
  ["preflight keeps accepted false", reviewedPreflight.accepted === false],
  ["preflight keeps canSend false", reviewedPreflight.canSend === false],
  ["preflight keeps sent disabled", reviewedPreflight.sentEnabled === false],
  ["preflight keeps booked disabled", reviewedPreflight.bookedEnabled === false],
  ["blocked preflight reports env missing", blockedPreflight.envConfigured === false],
  ["blocked preflight reports implementation missing", blockedPreflight.implementationReady === false],
  ["blocked preflight reports issues", blockedPreflight.issues.some((issue) => issue.includes("REGENT_OUTLOOK_CLIENT_ID"))],
  ["reviewed preflight validates packet", reviewedPreflight.reviewedPacketValid === true],
  ["reviewed preflight reports env configured", reviewedPreflight.envConfigured === true],
  ["reviewed preflight reports implementation ready", reviewedPreflight.implementationReady === true],
  ["reviewed preflight still blocks sending", reviewedPreflight.blockedReasons.includes("Real Outlook sending is not implemented.")],
  ["preflight links outlook status", reviewedPreflight.envStatusEndpoint === "/outlook/status"],
  ["preflight links implementation guard", reviewedPreflight.implementationGuardEndpoint === "/provider-implementation-guard?provider=outlook"],
  ["project plan next outlook preflight exists", projectPlan.includes("- First Outlook reviewed packet preflight")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook reviewed packet preflight test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook reviewed packet preflight test passed.");
