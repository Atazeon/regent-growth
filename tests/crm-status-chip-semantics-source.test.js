const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["sync chips are a list", app.includes('<div class="crm-sync-chips" role="list" aria-label="CRM sync status counts">')],
  ["sync chips use listitems", app.includes('<span role="listitem" data-state="${escapeHtml(chip.state)}"')],
  ["sync chip labels retained", app.includes('aria-label="CRM sync status: ${escapeHtml(chip.label)}"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM status chip semantics test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM status chip semantics test passed.");
