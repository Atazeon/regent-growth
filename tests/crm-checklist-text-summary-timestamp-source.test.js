const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function formatCrmChecklistSummary()");
const end = app.indexOf("function getCrmChecklistSummaryRecord()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["summary formatter exists", start !== -1],
  ["summary loads completed timestamp", body.includes('const completedAt = loadCrmChecklistState().__completedAt || "";')],
  ["summary includes completed timestamp", body.includes('completedAt ? `Completed at: ${formatDateTime(completedAt)}` : "Completed at: Not complete"')],
  ["summary includes timestamp before item lines", body.indexOf("Completed at:") !== -1 && body.indexOf("Completed at:") < body.indexOf("...lines")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist text summary timestamp test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist text summary timestamp test passed.");
