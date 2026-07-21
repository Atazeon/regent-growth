const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function updateCrmChecklistProgress()");
const end = app.indexOf("function formatCrmChecklistSummary()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["progress function exists", start !== -1],
  ["progress tracks empty checklist", body.includes("const hasItems = inputs.length > 0;")],
  ["empty checklist shows unavailable text", body.includes('? "Checklist unavailable"')],
  ["empty checklist is not marked complete", body.includes('crmChecklistProgress.dataset.state = hasItems && completed === inputs.length ? "complete" : "active";')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist completion display empty-state test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist completion display empty-state test passed.");
