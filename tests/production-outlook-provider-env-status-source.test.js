const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getProviderEnvStatus, getOutlookEnvStatus } = require("../production-provider-middleware");

const originalEnv = {
  REGENT_OUTLOOK_CLIENT_ID: process.env.REGENT_OUTLOOK_CLIENT_ID,
  REGENT_OUTLOOK_CLIENT_SECRET: process.env.REGENT_OUTLOOK_CLIENT_SECRET,
  REGENT_OUTLOOK_TENANT_ID: process.env.REGENT_OUTLOOK_TENANT_ID,
  REGENT_OUTLOOK_REFRESH_TOKEN: process.env.REGENT_OUTLOOK_REFRESH_TOKEN
};

for (const key of Object.keys(originalEnv)) {
  delete process.env[key];
}

const missingStatus = getOutlookEnvStatus();

process.env.REGENT_OUTLOOK_CLIENT_ID = "client-id";
process.env.REGENT_OUTLOOK_CLIENT_SECRET = "client-secret";
process.env.REGENT_OUTLOOK_TENANT_ID = "tenant-id";
process.env.REGENT_OUTLOOK_REFRESH_TOKEN = "refresh-token";

const configuredStatus = getProviderEnvStatus("outlook");

for (const [key, value] of Object.entries(originalEnv)) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

const checks = [
  ["middleware exports provider env status", typeof getProviderEnvStatus === "function"],
  ["middleware exports outlook env status", typeof getOutlookEnvStatus === "function"],
  ["middleware has outlook status route", source.includes('requestUrl.pathname === "/outlook/status"')],
  ["outlook status schema exists", missingStatus.schemaVersion === "regent-growth.outlook-provider-status.v1"],
  ["outlook status has timestamp", typeof missingStatus.checkedAt === "string" && missingStatus.checkedAt.length > 0],
  ["outlook status names provider", missingStatus.provider === "outlook"],
  ["outlook status blocks canSend", missingStatus.canSend === false],
  ["outlook status keeps sent disabled", missingStatus.sentEnabled === false],
  ["outlook status keeps booked disabled", missingStatus.bookedEnabled === false],
  ["outlook status includes client id env", missingStatus.requiredEnv.includes("REGENT_OUTLOOK_CLIENT_ID")],
  ["outlook status includes client secret env", missingStatus.requiredEnv.includes("REGENT_OUTLOOK_CLIENT_SECRET")],
  ["outlook status includes tenant env", missingStatus.requiredEnv.includes("REGENT_OUTLOOK_TENANT_ID")],
  ["outlook status includes refresh token env", missingStatus.requiredEnv.includes("REGENT_OUTLOOK_REFRESH_TOKEN")],
  ["outlook status reports missing env", missingStatus.missingEnv.length === 4],
  ["outlook status reports configured env", configuredStatus.configured === true],
  ["outlook status reports no missing env", configuredStatus.missingEnv.length === 0],
  ["outlook status records configured env", configuredStatus.configuredEnv.length === 4],
  ["outlook status links implementation guard", configuredStatus.implementationGuardEndpoint === "/provider-implementation-guard?provider=outlook"],
  ["outlook status links decision record", configuredStatus.decisionRecordEndpoint === "/provider-decision-record?provider=outlook"],
  ["project plan next outlook env status exists", projectPlan.includes("- First Outlook provider env status export")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production Outlook provider env status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production Outlook provider env status test passed.");
