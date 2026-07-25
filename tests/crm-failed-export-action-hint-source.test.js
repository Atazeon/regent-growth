const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function updateCrmRetryActionHints(failedCrmLeads, filteredFailedCrmLeads, reviewedCrmLeads)");
const end = app.indexOf("function updateSelectedReviewedCrmActionHint", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["retry action hints function exists", start !== -1],
  ["failed count calculated", body.includes("const failedCount = failedCrmLeads.length;")],
  ["failed JSON export button managed", body.includes("exportFailedCrmButton,")],
  ["failed JSON export disabled when empty", body.includes("failedCount === 0,\n    failedCount > 0 ? `Export ${failedCount} failed CRM syncs as JSON`")],
  ["failed JSON export empty hint exists", body.includes(': "No failed CRM syncs to export"')],
  ["failed CSV export button managed", body.includes("exportFailedCrmCsvButton,")],
  ["failed CSV export count hint exists", body.includes("? `Export ${failedCount} failed CRM syncs as CSV`")],
  ["failed CSV export empty hint exists", body.includes(': "No failed CRM syncs to export as CSV"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM failed export action hint test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM failed export action hint test passed.");
