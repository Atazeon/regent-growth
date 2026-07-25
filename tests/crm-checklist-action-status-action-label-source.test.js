const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getCrmChecklistActionStatus(action)");
const end = app.indexOf("function downloadCrmChecklistSummary()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["status function exists", start !== -1],
  ["status accepts action label", body.includes("function getCrmChecklistActionStatus(action)")],
  ["status starts with action label", body.includes("return `${action} CRM checklist")],
  ["copy action label used", app.includes('getCrmChecklistActionStatus("Copied")')],
  ["fallback copy action label used", app.includes('getCrmChecklistActionStatus("Selected and copied")')],
  ["json copy action label used", app.includes('getCrmChecklistActionStatus("Copied JSON")')],
  ["json fallback copy action label used", app.includes('getCrmChecklistActionStatus("Selected and copied JSON")')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist action status action label test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist action status action label test passed.");
