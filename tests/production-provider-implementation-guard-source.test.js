const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getProviderImplementationGuard } = require("../production-provider-middleware");

const guard = getProviderImplementationGuard("gmail");
const originalEnv = {
  REGENT_GMAIL_SEND_ADAPTER_REVIEWED: process.env.REGENT_GMAIL_SEND_ADAPTER_REVIEWED,
  REGENT_GMAIL_SUPPRESSION_REVIEWED: process.env.REGENT_GMAIL_SUPPRESSION_REVIEWED,
  REGENT_GMAIL_UNSUBSCRIBE_REVIEWED: process.env.REGENT_GMAIL_UNSUBSCRIBE_REVIEWED,
  REGENT_GMAIL_AUDIT_REVIEWED: process.env.REGENT_GMAIL_AUDIT_REVIEWED,
  REGENT_GMAIL_RETRY_REVIEWED: process.env.REGENT_GMAIL_RETRY_REVIEWED,
  REGENT_GMAIL_SETUP_APPROVED: process.env.REGENT_GMAIL_SETUP_APPROVED
};

for (const key of Object.keys(originalEnv)) {
  process.env[key] = "true";
}

const reviewedGuard = getProviderImplementationGuard("gmail");

for (const [key, value] of Object.entries(originalEnv)) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

const invalidGuard = getProviderImplementationGuard("smtp");
const controlKeys = guard.controls.map((control) => control.key);

const checks = [
  ["middleware exports implementation guard", typeof getProviderImplementationGuard === "function"],
  ["middleware has implementation guard route", source.includes('requestUrl.pathname === "/provider-implementation-guard"')],
  ["implementation guard schema exists", guard.schemaVersion === "regent-growth.provider-implementation-guard.v1"],
  ["implementation guard has timestamp", typeof guard.checkedAt === "string" && guard.checkedAt.length > 0],
  ["implementation guard keeps provider", guard.provider === "gmail"],
  ["implementation guard validates provider", guard.validProvider === true],
  ["implementation guard blocks sends", guard.approvedForRealSend === false],
  ["implementation guard cannot enable send", guard.canEnableSend === false],
  ["implementation guard keeps sent disabled", guard.sentEnabled === false],
  ["implementation guard keeps booked disabled", guard.bookedEnabled === false],
  ["implementation guard links decision record", guard.decisionRecordEndpoint === "/provider-decision-record"],
  ["implementation guard includes send adapter control", controlKeys.includes("send-adapter")],
  ["implementation guard includes suppression control", controlKeys.includes("suppression-enforcement")],
  ["implementation guard includes unsubscribe control", controlKeys.includes("unsubscribe-enforcement")],
  ["implementation guard includes audit control", controlKeys.includes("audit-logging")],
  ["implementation guard includes retry control", controlKeys.includes("retry-failure-handling")],
  ["implementation guard includes setup control", controlKeys.includes("manual-setup-review")],
  ["implementation guard reports missing controls", guard.missingControls.length === 6],
  ["reviewed guard accepts env evidence", reviewedGuard.missingControls.length === 0],
  ["reviewed guard still cannot send", reviewedGuard.canEnableSend === false],
  ["invalid guard reports invalid provider", invalidGuard.validProvider === false],
  ["invalid guard blocks invalid provider", invalidGuard.blockedReasons.includes("Selected provider is invalid.")],
  ["project plan next implementation guard exists", projectPlan.includes("- First provider-specific implementation guard")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production provider implementation guard test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production provider implementation guard test passed.");
