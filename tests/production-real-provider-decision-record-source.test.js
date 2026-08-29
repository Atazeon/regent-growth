const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getRealProviderDecisionRecord } = require("../production-provider-middleware");

const gmailRecord = getRealProviderDecisionRecord("gmail");
const invalidRecord = getRealProviderDecisionRecord("smtp");

const checks = [
  ["middleware exports provider decision record", typeof getRealProviderDecisionRecord === "function"],
  ["middleware has provider decision route", source.includes('requestUrl.pathname === "/provider-decision-record"')],
  ["decision record schema exists", gmailRecord.schemaVersion === "regent-growth.real-provider-decision-record.v1"],
  ["decision record has timestamp", typeof gmailRecord.generatedAt === "string" && gmailRecord.generatedAt.length > 0],
  ["decision record keeps provider", gmailRecord.provider === "gmail"],
  ["decision record keeps requested provider", gmailRecord.requestedProvider === "gmail"],
  ["decision record validates provider", gmailRecord.validProvider === true],
  ["decision record blocks sends", gmailRecord.approvedForRealSend === false],
  ["decision record keeps sent disabled", gmailRecord.sentEnabled === false],
  ["decision record keeps booked disabled", gmailRecord.bookedEnabled === false],
  ["decision record links selection plan", gmailRecord.selectionPlanEndpoint === "/provider-selection-plan"],
  ["decision record links preflight", gmailRecord.preflightEndpoint === "/provider-preflight"],
  ["decision record includes candidate", gmailRecord.candidate.provider === "gmail"],
  ["decision record includes decision inputs", gmailRecord.requiredDecisionInputs.includes("Primary sending mailbox owner")],
  ["decision record requires adapter", gmailRecord.requiredImplementationBeforeSend.includes("Provider-specific send adapter")],
  ["decision record requires suppression", gmailRecord.requiredImplementationBeforeSend.includes("Suppression-list enforcement")],
  ["decision record requires unsubscribe", gmailRecord.requiredImplementationBeforeSend.includes("Unsubscribe or opt-out enforcement")],
  ["decision record blocks approval", gmailRecord.blockedReasons.includes("Decision record is not send approval.")],
  ["invalid provider marked invalid", invalidRecord.validProvider === false],
  ["invalid provider records request", invalidRecord.requestedProvider === "smtp"],
  ["invalid provider adds blocked reason", invalidRecord.blockedReasons.includes("Requested provider is not one of gmail, outlook, or custom.")],
  ["project plan next decision record exists", projectPlan.includes("- First real provider adapter decision record")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production real provider decision record test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production real provider decision record test passed.");
