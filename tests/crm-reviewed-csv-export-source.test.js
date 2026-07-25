const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function exportReviewedCrmSyncCsv()");
const end = app.indexOf("function formatCrmStatusSummary()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["reviewed CSV export function exists", start !== -1],
  ["reviewed CSV export guards empty queue", body.includes('setCrmSetupStatus("No reviewed CRM syncs to export.", "error");')],
  ["reviewed CSV headers include failure reason", body.includes('"failureReasonGroup"')],
  ["reviewed CSV headers include latest note", body.includes('"latestCrmSyncNote"')],
  ["reviewed CSV uses reviewed reason", body.includes("failureReasonGroup: getReviewedCrmReason(prospect),")],
  ["reviewed CSV uses latest note", body.includes("latestCrmSyncNote: getLatestCrmSyncNote(prospect)")],
  ["reviewed CSV escapes cells", body.includes("return headers.map((header) => csvCell(exportRecord[header])).join(\",\");")],
  ["reviewed CSV writes file", body.includes('downloadFile("regent-growth-crm-reviewed-syncs.csv", [headers.join(","), ...rows].join("\\n"), "text/csv;charset=utf-8");')],
  ["reviewed CSV reports status", body.includes("setCrmSetupStatus(`Exported ${reviewedCrmLeads.length} reviewed CRM sync${reviewedCrmLeads.length === 1 ? \"\" : \"s\"} as CSV.`);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed CSV export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed CSV export test passed.");
