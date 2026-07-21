const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function updateCrmChecklistProgress()");
const end = app.indexOf("function formatCrmChecklistSummary()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["progress function exists", start !== -1],
  ["unavailable label exists", body.includes('? "CRM checklist unavailable"')],
  ["complete label exists", body.includes('? "CRM checklist complete"')],
  ["partial label includes counts and percent", body.includes("`${completed} of ${inputs.length} CRM checklist items complete (${completionPercent}%)`;")],
  ["visible unavailable text exists", body.includes('? "Checklist unavailable"')],
  ["visible complete text exists", body.includes('? "Checklist complete"')],
  ["visible partial text includes counts and percent", body.includes("`${completed} of ${inputs.length} complete (${completionPercent}%)`;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist progress label branches test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist progress label branches test passed.");
