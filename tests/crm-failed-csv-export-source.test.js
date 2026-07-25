const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function exportFailedCrmSyncCsv()");
const end = app.indexOf("function getCrmFailureReasonFileSuffix()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["failed CSV export function exists", start !== -1],
  ["failed CSV export filters by reason", body.includes("const failedCrmLeads = filterCrmLeadsByReason(getFailedCrmSyncLeads());")],
  ["failed CSV export guards empty queue", body.includes("No failed CRM syncs to export.")],
  ["failed CSV headers include failure reason", body.includes('"failureReasonGroup"')],
  ["failed CSV includes latest note", body.includes("latestCrmSyncNote: getLatestCrmSyncNote(prospect)")],
  ["failed CSV escapes cells", body.includes("return headers.map((header) => csvCell(exportRecord[header])).join(\",\");")],
  ["failed CSV writes filtered filename", body.includes("`regent-growth-crm-failed-syncs${filterSuffix}.csv`")],
  ["failed CSV reports status", body.includes("setCrmSetupStatus(`Exported ${failedCrmLeads.length}${crmFailureReasonFilter === \"all\" ? \"\" : ` ${crmFailureReasonFilter}`} failed CRM sync${failedCrmLeads.length === 1 ? \"\" : \"s\"} as CSV.`);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM failed CSV export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM failed CSV export test passed.");
