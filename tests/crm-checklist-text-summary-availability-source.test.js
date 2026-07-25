const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function formatCrmChecklistSummary()");
const end = app.indexOf("function getCrmChecklistSummaryRecord()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["summary formatter exists", start !== -1],
  ["summary reads checklist inputs", body.includes("const inputs = getCrmChecklistInputs();")],
  ["summary includes available status", body.includes('inputs.length > 0 ? "Status: Available" : "Status: Checklist unavailable",')],
  ["summary includes progress counts", body.includes("`${completed} of ${inputs.length} complete (${completionPercent}%)`,")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist text summary availability test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist text summary availability test passed.");
