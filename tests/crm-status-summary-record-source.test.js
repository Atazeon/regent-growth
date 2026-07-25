const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getCrmStatusSummaryRecord()");
const end = app.indexOf("async function copyCrmStatusSummary()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["CRM status summary record exists", start !== -1],
  ["record includes exported timestamp", body.includes("exportedAt: new Date().toISOString(),")],
  ["record includes warm lead count", body.includes("warmLeadCount: warmLeads.length,")],
  ["record includes failed count", body.includes("failedCount: failedCrmLeads.length,")],
  ["record includes reviewed count", body.includes("reviewedCount: reviewedCrmLeads.length,")],
  ["record includes syncing count", body.includes('syncingCount: prospects.filter((prospect) => prospect.crmSyncStatus === "Syncing").length,')],
  ["record includes failure reasons", body.includes("failureReasons: getCrmFailureReasonCounts(failedCrmLeads),")],
  ["record includes failed queue", body.includes("failedQueue: failedCrmLeads.slice(0, 10).map(getCrmRecord),")],
  ["record includes reviewed queue", body.includes("reviewedQueue: reviewedCrmLeads.slice(0, 10).map(getCrmRecord)")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM status summary record test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM status summary record test passed.");
