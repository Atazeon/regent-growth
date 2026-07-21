const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function copyCrmChecklistSummary()");
const end = app.indexOf("function getCrmChecklistExportStamp()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["summary copy function exists", start !== -1],
  ["summary copy uses fallback clipboard helper", body.includes("await copyTextWithFallback(formatCrmChecklistSummary());")],
  ["summary copy reports direct status", body.includes('getCrmChecklistActionStatus("Copied")')],
  ["summary copy reports fallback status", body.includes('getCrmChecklistActionStatus("Selected and copied")')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist summary copy status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist summary copy status test passed.");
