const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["status chip title exists", app.includes('title="CRM sync status: ${escapeHtml(chip.label)}"')],
  ["status chip aria exists", app.includes('aria-label="CRM sync status: ${escapeHtml(chip.label)}"')],
  ["status group labelled", app.includes('<div class="crm-sync-chips" role="list" aria-label="CRM sync status counts">')],
  ["status item role exists", app.includes('<span role="listitem" data-state="${escapeHtml(chip.state)}"')],
  ["status state preserved", app.includes('data-state="${escapeHtml(chip.state)}" title="CRM sync status: ${escapeHtml(chip.label)}"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM sync status chip labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM sync status chip labels test passed.");
