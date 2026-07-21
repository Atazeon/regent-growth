const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["has items calculated", app.includes("const hasItems = inputs.length > 0;")],
  ["copy download buttons grouped", app.includes("[copyCrmChecklistButton, copyCrmChecklistJsonButton, downloadCrmChecklistButton, downloadCrmChecklistJsonButton].forEach((button) => {")],
  ["copy download disabled when no items", app.includes("button.disabled = !hasItems;")],
  ["reset still uses completed count", app.includes("resetCrmChecklistButton.disabled = completed === 0;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist action disabled test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist action disabled test passed.");
