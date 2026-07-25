const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getCrmChecklistSummaryRecord()");
const end = app.indexOf("async function copyCrmChecklistSummary()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["summary record function exists", start !== -1],
  ["json payload includes exported timestamp", body.includes("exportedAt: new Date().toISOString(),")],
  ["json payload includes completed timestamp", body.includes('completedAt: loadCrmChecklistState().__completedAt || "",')],
  ["timestamps precede counts", body.indexOf("exportedAt:") !== -1 && body.indexOf("completedAt:") !== -1 && body.indexOf("completedAt:") < body.indexOf("completedCount,")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist JSON payload timestamp test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist JSON payload timestamp test passed.");
