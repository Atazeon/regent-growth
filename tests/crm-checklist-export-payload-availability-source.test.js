const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getCrmChecklistSummaryRecord()");
const end = app.indexOf("async function copyCrmChecklistSummary()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["summary record function exists", start !== -1],
  ["record builds item list", body.includes("const items = getCrmChecklistInputs().map((input) => ({")],
  ["record only completes when items exist", body.includes("const complete = items.length > 0 && completedCount === items.length;")],
  ["record exposes availability", body.includes("available: items.length > 0,")],
  ["record exposes complete flag", body.includes("complete,")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist export payload availability test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist export payload availability test passed.");
