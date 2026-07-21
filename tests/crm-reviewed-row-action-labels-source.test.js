const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["reviewed open title exists", app.includes('title="Open reviewed CRM sync for ${escapeHtml(prospect.company)}"')],
  ["reviewed open aria exists", app.includes('aria-label="Open reviewed CRM sync for ${escapeHtml(prospect.company)}"')],
  ["reviewed requeue title exists", app.includes('title="Requeue reviewed CRM sync for ${escapeHtml(prospect.company)}"')],
  ["reviewed requeue aria exists", app.includes('aria-label="Requeue reviewed CRM sync for ${escapeHtml(prospect.company)}"')],
  ["reviewed open action preserved", app.includes('data-action="open-crm-reviewed" data-index="${escapeHtml(index)}" title="Open reviewed CRM sync for ${escapeHtml(prospect.company)}"')],
  ["reviewed requeue action preserved", app.includes('data-action="requeue-crm-reviewed-one" data-index="${escapeHtml(index)}" title="Requeue reviewed CRM sync for ${escapeHtml(prospect.company)}"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed row action labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed row action labels test passed.");
