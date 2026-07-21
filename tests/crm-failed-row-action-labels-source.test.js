const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["failed open title exists", app.includes('title="Open failed CRM sync for ${escapeHtml(prospect.company)}"')],
  ["failed open aria exists", app.includes('aria-label="Open failed CRM sync for ${escapeHtml(prospect.company)}"')],
  ["failed retry title exists", app.includes('title="Retry failed CRM sync for ${escapeHtml(prospect.company)}"')],
  ["failed retry aria exists", app.includes('aria-label="Retry failed CRM sync for ${escapeHtml(prospect.company)}"')],
  ["failed open action preserved", app.includes('data-action="open-crm-failed" data-index="${escapeHtml(index)}" title="Open failed CRM sync for ${escapeHtml(prospect.company)}"')],
  ["failed retry action preserved", app.includes('data-action="retry-crm-one" data-index="${escapeHtml(index)}" title="Retry failed CRM sync for ${escapeHtml(prospect.company)}"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM failed row action labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM failed row action labels test passed.");
