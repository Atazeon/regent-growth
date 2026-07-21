const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["formatted value calculated once", app.includes("const formattedValue = formatCrmPreviewValue(value);")],
  ["field row has listitem role", app.includes('<div class="crm-field-row" role="listitem"')],
  ["field row has combined label", app.includes('aria-label="${escapeHtml(field)}: ${escapeHtml(formattedValue)}"')],
  ["field value uses formatted value", app.includes("<span>${escapeHtml(formattedValue)}</span>")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM field row labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM field row labels test passed.");
