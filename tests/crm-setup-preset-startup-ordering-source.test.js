const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const restoreIndex = app.lastIndexOf("restoreCrmPresetPreference();");
const renderIndex = app.lastIndexOf("renderCrmProviderPreset();");
const checkIndex = app.lastIndexOf("checkCrmSetup();");

const checks = [
  ["startup restores CRM preset", restoreIndex !== -1],
  ["startup renders CRM preset", renderIndex !== -1],
  ["startup checks CRM setup", checkIndex !== -1],
  ["startup restores before render", restoreIndex !== -1 && renderIndex !== -1 && restoreIndex < renderIndex],
  ["startup renders preset before setup check", renderIndex !== -1 && checkIndex !== -1 && renderIndex < checkIndex]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup preset startup ordering test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup preset startup ordering test passed.");
