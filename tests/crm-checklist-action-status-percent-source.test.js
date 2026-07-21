const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getCrmChecklistActionStatus(action)");
const end = app.indexOf("function downloadCrmChecklistSummary()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["status function exists", start !== -1],
  ["status reads percent from summary record", body.includes("const { completedCount, totalCount, completionPercent } = getCrmChecklistSummaryRecord();")],
  ["status reports completion percent", body.includes("return `${action} CRM checklist (${completedCount}/${totalCount}, ${completionPercent}%).`;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist action status percent test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist action status percent test passed.");
