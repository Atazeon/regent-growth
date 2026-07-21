const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const copyTest = fs.readFileSync(path.join(root, "tests", "crm-checklist-copy-summary-source.test.js"), "utf8");
const copyJsonTest = fs.readFileSync(path.join(root, "tests", "crm-checklist-json-copy-source.test.js"), "utf8");
const downloadTest = fs.readFileSync(path.join(root, "tests", "crm-checklist-download-summary-source.test.js"), "utf8");
const statusTest = fs.readFileSync(path.join(root, "tests", "crm-checklist-action-status-message-source.test.js"), "utf8");

const checks = [
  ["copy summary test covers status helper", copyTest.includes("copy status uses helper")],
  ["copy json test covers status helper", copyJsonTest.includes("copy json status exists")],
  ["download summary test covers status helper", downloadTest.includes("download status uses helper")],
  ["status message test covers json download", statusTest.includes("download json uses status")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist action status coverage test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist action status coverage test passed.");
