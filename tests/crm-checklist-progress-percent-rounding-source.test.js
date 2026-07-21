const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const updateStart = app.indexOf("function updateCrmChecklistProgress()");
const updateEnd = app.indexOf("function formatCrmChecklistSummary()", updateStart);
const summaryEnd = app.indexOf("function getCrmChecklistSummaryRecord()", updateEnd);
const recordEnd = app.indexOf("function getCrmChecklistExportStamp()", summaryEnd);

const updateBody = updateStart === -1 || updateEnd === -1 ? "" : app.slice(updateStart, updateEnd);
const summaryBody = updateEnd === -1 || summaryEnd === -1 ? "" : app.slice(updateEnd, summaryEnd);
const recordBody = summaryEnd === -1 || recordEnd === -1 ? "" : app.slice(summaryEnd, recordEnd);

const roundingExpression = "Math.round((completed / inputs.length) * 100)";
const recordRoundingExpression = "Math.round((completedCount / items.length) * 100)";

const checks = [
  ["progress function exists", updateStart !== -1],
  ["summary formatter exists", updateEnd !== -1],
  ["summary record function exists", summaryEnd !== -1],
  ["progress percent rounds whole number", updateBody.includes(roundingExpression)],
  ["text summary percent rounds whole number", summaryBody.includes(roundingExpression)],
  ["json summary percent rounds whole number", recordBody.includes(recordRoundingExpression)]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist progress percent rounding test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist progress percent rounding test passed.");
