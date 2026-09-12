const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getProviderSendFeatureFlagContract } = require("../production-provider-middleware");

const original = {
  REGENT_GMAIL_CAN_SEND: process.env.REGENT_GMAIL_CAN_SEND,
  REGENT_GMAIL_SETUP_APPROVED: process.env.REGENT_GMAIL_SETUP_APPROVED
};

delete process.env.REGENT_GMAIL_CAN_SEND;
delete process.env.REGENT_GMAIL_SETUP_APPROVED;
const missingContract = getProviderSendFeatureFlagContract("gmail");

process.env.REGENT_GMAIL_CAN_SEND = "true";
process.env.REGENT_GMAIL_SETUP_APPROVED = "true";
const partialContract = getProviderSendFeatureFlagContract("gmail");
const outlookContract = getProviderSendFeatureFlagContract("outlook");
const invalidContract = getProviderSendFeatureFlagContract("custom");

for (const [key, value] of Object.entries(original)) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

const checks = [
  ["middleware exports feature flag contract", typeof getProviderSendFeatureFlagContract === "function"],
  ["middleware has feature flag route", source.includes('requestUrl.pathname === "/provider-send-feature-flags"')],
  ["contract schema exists", missingContract.schemaVersion === "regent-growth.provider-send-feature-flag-contract.v1"],
  ["contract has timestamp", typeof missingContract.checkedAt === "string" && missingContract.checkedAt.length > 0],
  ["contract names provider", missingContract.provider === "gmail"],
  ["contract validates provider", missingContract.validProvider === true],
  ["contract blocks approval", missingContract.approvedForRealSend === false],
  ["contract blocks canSend", missingContract.canSend === false],
  ["contract keeps sent disabled", missingContract.sentEnabled === false],
  ["contract keeps booked disabled", missingContract.bookedEnabled === false],
  ["contract requires reviewed flag", missingContract.requiredFlags.includes("REGENT_GMAIL_SEND_ADAPTER_REVIEWED")],
  ["contract requires can send flag", missingContract.requiredFlags.includes("REGENT_GMAIL_CAN_SEND")],
  ["contract reports missing can send", missingContract.missingFlags.includes("REGENT_GMAIL_CAN_SEND")],
  ["contract reports enabled flags", partialContract.enabledFlags.includes("REGENT_GMAIL_CAN_SEND")],
  ["contract keeps partial missing flags", partialContract.missingFlags.includes("REGENT_GMAIL_SEND_ADAPTER_REVIEWED")],
  ["outlook contract requires can send flag", outlookContract.requiredFlags.includes("REGENT_OUTLOOK_CAN_SEND")],
  ["invalid contract rejects provider", invalidContract.validProvider === false],
  ["contract blocks send approval", missingContract.blockedReasons.includes("Feature flag contract is not send approval.")],
  ["project plan next feature flag contract exists", projectPlan.includes("- First provider send adapter feature flag contract")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production provider send feature flag contract test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production provider send feature flag contract test passed.");
