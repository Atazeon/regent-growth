const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function exportReviewedCrmSyncs()");
const end = app.indexOf("function exportReviewedCrmSyncCsv()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["reviewed JSON export function exists", start !== -1],
  ["reviewed JSON export guards empty queue", body.includes('setCrmSetupStatus("No reviewed CRM syncs to export.", "error");')],
  ["reviewed JSON export source set", body.includes('source: "regent-growth-crm-reviewed-queue",')],
  ["reviewed JSON export count set", body.includes("reviewedCount: reviewedCrmLeads.length,")],
  ["reviewed JSON export includes failure reason", body.includes("failureReasonGroup: getReviewedCrmReason(prospect),")],
  ["reviewed JSON export includes latest note", body.includes("latestCrmSyncNote: getLatestCrmSyncNote(prospect)")],
  ["reviewed JSON export writes JSON", body.includes('downloadFile(`regent-growth-crm-reviewed-syncs-${stamp}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");')],
  ["reviewed JSON export reports status", body.includes("setCrmSetupStatus(`Exported ${reviewedCrmLeads.length} reviewed CRM sync${reviewedCrmLeads.length === 1 ? \"\" : \"s\"}.`);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed JSON export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed JSON export test passed.");
