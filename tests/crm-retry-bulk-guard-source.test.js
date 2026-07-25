const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function retryFailedCrmSyncs()");
const end = app.indexOf("function showFailedCrmSyncs()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["bulk retry function exists", start !== -1],
  ["bulk retry reads failed leads", body.includes("const allFailedCrmLeads = getFailedCrmSyncLeads();")],
  ["bulk retry applies reason filter", body.includes("const failedCrmLeads = filterCrmLeadsByReason(allFailedCrmLeads);")],
  ["bulk retry guards empty queue", body.includes("if (failedCrmLeads.length === 0) {")],
  ["bulk retry reports empty all queue", body.includes('"No failed CRM syncs to retry."')],
  ["bulk retry reports empty filtered queue", body.includes("`No ${crmFailureReasonFilter} CRM sync failures to retry.`")],
  ["bulk retry empty state is error", body.includes('"error");')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM retry bulk guard test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM retry bulk guard test passed.");
