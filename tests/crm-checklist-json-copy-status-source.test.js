const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function copyCrmChecklistJson()");
const end = app.indexOf("function getProspectFieldNames()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["json copy function exists", start !== -1],
  ["json copy uses fallback clipboard helper", body.includes("await copyTextWithFallback(JSON.stringify(getCrmChecklistSummaryRecord(), null, 2));")],
  ["json copy reports direct status", body.includes('getCrmChecklistActionStatus("Copied JSON")')],
  ["json copy reports fallback status", body.includes('getCrmChecklistActionStatus("Selected and copied JSON")')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist JSON copy status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist JSON copy status test passed.");
