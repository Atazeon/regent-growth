const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function updateCrmRetryActionHints(failedCrmLeads, filteredFailedCrmLeads, reviewedCrmLeads)");
const end = app.indexOf("function updateSelectedReviewedCrmActionHint", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["retry action hints function exists", start !== -1],
  ["reviewed JSON export button is managed", body.includes("exportReviewedCrmButton,")],
  ["reviewed JSON export disabled when empty", body.includes("reviewedCount === 0,\n    reviewedCount > 0 ? `Export ${reviewedCount} reviewed CRM syncs as JSON`")],
  ["reviewed JSON export empty hint exists", body.includes(': "No reviewed CRM syncs to export"')],
  ["reviewed CSV export button is managed", body.includes("exportReviewedCrmCsvButton,")],
  ["reviewed CSV export count hint exists", body.includes("? `Export ${reviewedCount} reviewed CRM syncs as CSV`")],
  ["reviewed CSV export empty hint exists", body.includes(': "No reviewed CRM syncs to export as CSV"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed export action hints test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed export action hints test passed.");
