const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["setup actions wrap", styles.includes(".setup-actions {\n  display: flex;\n  flex-wrap: wrap;")],
  ["setup actions stretch", styles.includes("align-items: stretch;")],
  ["setup action buttons flex", styles.includes(".setup-actions > button,\n.setup-action-group button {\n  flex: 1 1 150px;")],
  ["setup action stable height", styles.includes("min-height: 40px;")],
  ["setup action text wraps", styles.includes("white-space: normal;")],
  ["crm setup uses setup actions", html.includes('<div class="setup-actions">\n            <div class="setup-action-group"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup action wrapping test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup action wrapping test passed.");
