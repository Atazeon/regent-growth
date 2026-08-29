const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getRealProviderSelectionPlan } = require("../production-provider-middleware");

const plan = getRealProviderSelectionPlan();
const providers = plan.candidates.map((candidate) => candidate.provider);
const gmail = plan.candidates.find((candidate) => candidate.provider === "gmail");
const outlook = plan.candidates.find((candidate) => candidate.provider === "outlook");
const custom = plan.candidates.find((candidate) => candidate.provider === "custom");

const checks = [
  ["middleware exports provider selection plan", typeof getRealProviderSelectionPlan === "function"],
  ["middleware has provider selection route", source.includes('requestUrl.pathname === "/provider-selection-plan"')],
  ["selection plan schema exists", plan.schemaVersion === "regent-growth.real-provider-selection-plan.v1"],
  ["selection plan has timestamp", typeof plan.generatedAt === "string" && plan.generatedAt.length > 0],
  ["selection plan blocks real sends", plan.approvedForRealSend === false],
  ["selection plan keeps sent disabled", plan.sentEnabled === false],
  ["selection plan keeps booked disabled", plan.bookedEnabled === false],
  ["selection plan has recommendation", ["gmail", "outlook", "custom"].includes(plan.recommendation)],
  ["selection plan links preflight", plan.preflightEndpoint === "/provider-preflight"],
  ["selection plan includes gmail", providers.includes("gmail")],
  ["selection plan includes outlook", providers.includes("outlook")],
  ["selection plan includes custom", providers.includes("custom")],
  ["gmail includes env count", gmail.requiredEnvCount === 3],
  ["outlook includes env count", outlook.requiredEnvCount === 4],
  ["custom includes env count", custom.requiredEnvCount === 2],
  ["candidates keep canSend false", plan.candidates.every((candidate) => candidate.canSend === false)],
  ["candidates include blocked reasons", plan.candidates.every((candidate) => candidate.blockedReasons.includes("Adapter send implementation is not enabled."))],
  ["selection plan requires mailbox owner", plan.requiredDecisionInputs.includes("Primary sending mailbox owner")],
  ["selection plan requires suppression source", plan.requiredDecisionInputs.includes("Suppression-list source")],
  ["selection plan requires daily send limit", plan.requiredDecisionInputs.includes("Daily send limit")],
  ["project plan next selection plan exists", projectPlan.includes("- First real provider adapter selection plan")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production real provider selection plan test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production real provider selection plan test passed.");
