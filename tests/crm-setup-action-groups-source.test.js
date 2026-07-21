const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const groupLabels = [
  "CRM connection actions",
  "CRM sync actions",
  "CRM retry actions",
  "CRM export actions",
  "CRM summary actions",
  "CRM cleanup actions"
];

const checks = [
  ...groupLabels.map((label) => [`${label} group`, html.includes(`role="group" aria-label="${label}"`)]),
  ["group styling exists", styles.includes(".setup-action-group {\n  display: flex;")],
  ["group width is stable", styles.includes("flex: 1 1 260px;")],
  ["group wraps buttons", styles.includes("flex-wrap: wrap;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup action groups test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup action groups test passed.");
