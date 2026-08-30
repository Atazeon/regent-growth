const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getGmailEnvStatus } = require("../production-provider-middleware");

const originalEnv = {
  REGENT_GMAIL_CLIENT_ID: process.env.REGENT_GMAIL_CLIENT_ID,
  REGENT_GMAIL_CLIENT_SECRET: process.env.REGENT_GMAIL_CLIENT_SECRET,
  REGENT_GMAIL_REFRESH_TOKEN: process.env.REGENT_GMAIL_REFRESH_TOKEN
};

for (const key of Object.keys(originalEnv)) {
  delete process.env[key];
}

const missingStatus = getGmailEnvStatus();

process.env.REGENT_GMAIL_CLIENT_ID = "client-id";
process.env.REGENT_GMAIL_CLIENT_SECRET = "client-secret";
process.env.REGENT_GMAIL_REFRESH_TOKEN = "refresh-token";

const configuredStatus = getGmailEnvStatus();

for (const [key, value] of Object.entries(originalEnv)) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

const checks = [
  ["middleware exports gmail env status", typeof getGmailEnvStatus === "function"],
  ["middleware has gmail status route", source.includes('requestUrl.pathname === "/gmail/status"')],
  ["gmail status schema exists", missingStatus.schemaVersion === "regent-growth.gmail-provider-status.v1"],
  ["gmail status has timestamp", typeof missingStatus.checkedAt === "string" && missingStatus.checkedAt.length > 0],
  ["gmail status names provider", missingStatus.provider === "gmail"],
  ["gmail status blocks canSend", missingStatus.canSend === false],
  ["gmail status keeps sent disabled", missingStatus.sentEnabled === false],
  ["gmail status keeps booked disabled", missingStatus.bookedEnabled === false],
  ["gmail status includes client id env", missingStatus.requiredEnv.includes("REGENT_GMAIL_CLIENT_ID")],
  ["gmail status includes client secret env", missingStatus.requiredEnv.includes("REGENT_GMAIL_CLIENT_SECRET")],
  ["gmail status includes refresh token env", missingStatus.requiredEnv.includes("REGENT_GMAIL_REFRESH_TOKEN")],
  ["gmail status reports missing env", missingStatus.missingEnv.length === 3],
  ["gmail status reports configured env", configuredStatus.configured === true],
  ["gmail status reports no missing env", configuredStatus.missingEnv.length === 0],
  ["gmail status records configured env", configuredStatus.configuredEnv.length === 3],
  ["gmail status links implementation guard", configuredStatus.implementationGuardEndpoint === "/provider-implementation-guard?provider=gmail"],
  ["gmail status links decision record", configuredStatus.decisionRecordEndpoint === "/provider-decision-record?provider=gmail"],
  ["project plan next gmail env status exists", projectPlan.includes("- First Gmail provider adapter env status export")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Gmail provider env status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Gmail provider env status test passed.");
