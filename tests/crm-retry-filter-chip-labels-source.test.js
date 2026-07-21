const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["all label created", app.includes("const allLabel = `Show all ${failedCrmLeads.length} failed CRM syncs`;")],
  ["all chip title exists", app.includes('title="${escapeHtml(allLabel)}" aria-label="${escapeHtml(allLabel)}"')],
  ["reason chip title exists", app.includes('title="Show ${escapeHtml(count)} ${escapeHtml(group)} CRM sync failures"')],
  ["reason chip aria exists", app.includes('aria-label="Show ${escapeHtml(count)} ${escapeHtml(group)} CRM sync failures"')],
  ["reason action preserved", app.includes('data-action="set-crm-reason-filter" data-reason="${escapeHtml(group)}"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM retry filter chip labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM retry filter chip labels test passed.");
