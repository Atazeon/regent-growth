const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function markFailedCrmSyncsReviewed()");
const end = app.indexOf("function requeueReviewedCrmSyncs()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["mark reviewed function exists", start !== -1],
  ["mark reviewed filters failed leads", body.includes("const failedCrmLeads = filterCrmLeadsByReason(getFailedCrmSyncLeads());")],
  ["mark reviewed guards empty queue", body.includes("if (failedCrmLeads.length === 0) {")],
  ["mark reviewed reports empty all queue", body.includes('"No failed CRM syncs to mark reviewed."')],
  ["mark reviewed reports empty filtered queue", body.includes("`No ${crmFailureReasonFilter} CRM sync failures to mark reviewed.`")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed mark guard test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed mark guard test passed.");
