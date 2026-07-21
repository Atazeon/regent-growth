const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const checks = [
  ["actions can wrap", styles.includes(".checklist-heading-actions {\n  align-items: center;\n  display: flex;\n  flex-wrap: wrap;")],
  ["actions max width exists", styles.includes("max-width: 620px;")],
  ["progress can shrink", styles.includes("flex: 1 1 120px;")],
  ["action button sizing exists", styles.includes(".checklist-heading-actions button {\n  flex: 1 1 135px;")],
  ["action button height stable", styles.includes("min-height: 38px;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist action wrapping test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist action wrapping test passed.");
