const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function formatCrmStatusSummary()");
const end = app.indexOf("function getCrmStatusSummaryRecord()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["CRM status summary formatter exists", start !== -1],
  ["summary includes generated timestamp", body.includes("`Generated: ${new Date().toISOString()}`")],
  ["summary includes warm lead count", body.includes("`Warm Leads: ${warmLeads.length}`")],
  ["summary includes failed count", body.includes("`Failed: ${failedCrmLeads.length}`")],
  ["summary includes reviewed count", body.includes("`Reviewed: ${reviewedCrmLeads.length}`")],
  ["summary includes failure reasons", body.includes("`Failure Reasons: ${Object.entries(getCrmFailureReasonCounts(failedCrmLeads))")],
  ["summary includes failed queue section", body.includes('"Failed queue:"')],
  ["summary includes reviewed queue section", body.includes('"Reviewed queue:"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM status summary text test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM status summary text test passed.");
