const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["reason chips are grouped", app.includes('<div class="crm-reason-chips" role="group" aria-label="CRM failure reason filters">')],
  ["all filter remains", app.includes('data-action="set-crm-reason-filter" data-reason="all"')],
  ["reason filters remain", app.includes('data-action="set-crm-reason-filter" data-reason="${escapeHtml(group)}"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reason chip semantics test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reason chip semantics test passed.");
