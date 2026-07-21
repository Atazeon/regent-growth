const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const textTest = fs.readFileSync(path.join(root, "tests", "crm-checklist-text-percent-source.test.js"), "utf8");
const jsonTest = fs.readFileSync(path.join(root, "tests", "crm-checklist-json-export-source.test.js"), "utf8");

const checks = [
  ["text export test covers completed timestamp", textTest.includes("text completed timestamp displayed")],
  ["json export test covers exported timestamp", jsonTest.includes("record includes exported timestamp")],
  ["json export test covers completed timestamp", jsonTest.includes("record includes completed timestamp")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist export timestamp coverage test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist export timestamp coverage test passed.");
