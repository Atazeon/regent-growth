const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function exportFailedCrmSyncs()");
const end = app.indexOf("function exportFailedCrmSyncCsv()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["failed JSON export function exists", start !== -1],
  ["failed JSON export filters by reason", body.includes("const failedCrmLeads = filterCrmLeadsByReason(getFailedCrmSyncLeads());")],
  ["failed JSON export guards empty queue", body.includes("No failed CRM syncs to export.")],
  ["failed JSON source set", body.includes('source: "regent-growth-crm-retry-queue",')],
  ["failed JSON includes reason filter", body.includes("failureReasonFilter: crmFailureReasonFilter,")],
  ["failed JSON includes failure reason group", body.includes("failureReasonGroup: getCrmFailureReasonGroup(getLatestCrmSyncNote(prospect)),")],
  ["failed JSON includes latest note", body.includes("latestCrmSyncNote: getLatestCrmSyncNote(prospect)")],
  ["failed JSON writes filtered filename", body.includes("`regent-growth-crm-failed-syncs${filterSuffix}-${stamp}.json`")],
  ["failed JSON reports status", body.includes("setCrmSetupStatus(`Exported ${failedCrmLeads.length}${crmFailureReasonFilter === \"all\" ? \"\" : ` ${crmFailureReasonFilter}`} failed CRM sync${failedCrmLeads.length === 1 ? \"\" : \"s\"}.`);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM failed JSON export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM failed JSON export test passed.");
