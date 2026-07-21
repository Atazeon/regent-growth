const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const textTest = fs.readFileSync(path.join(root, "tests", "crm-checklist-text-percent-source.test.js"), "utf8");
const jsonTest = fs.readFileSync(path.join(root, "tests", "crm-checklist-json-export-source.test.js"), "utf8");

const checks = [
  ["text export test covers status", textTest.includes("text status displayed")],
  ["json export test covers availability", jsonTest.includes("record includes availability")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist export status coverage test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist export status coverage test passed.");
