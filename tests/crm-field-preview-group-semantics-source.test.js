const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["group id calculated", app.includes('const groupId = `crmFieldGroup${group.label.replace(/[^a-z0-9]/gi, "")}`;')],
  ["group section labelled region", app.includes('<section role="region" aria-labelledby="${escapeHtml(groupId)}">')],
  ["group heading id exists", app.includes('<h4 id="${escapeHtml(groupId)}">${escapeHtml(group.label)}</h4>')],
  ["group fields retained", app.includes("group.fields.map(({ field, value }) => {")],
  ["group field values formatted", app.includes("const formattedValue = formatCrmPreviewValue(value);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM field preview group semantics test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM field preview group semantics test passed.");
