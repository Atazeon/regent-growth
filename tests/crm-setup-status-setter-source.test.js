const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function setCrmSetupStatus(message, state = \"\")");
const end = app.indexOf("const crmProviderPresets", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["CRM setup status setter exists", start !== -1],
  ["status setter writes message", body.includes("crmSetupStatus.textContent = message;")],
  ["status setter writes state", body.includes("crmSetupStatus.dataset.state = state;")],
  ["status setter default state is empty", body.includes('function setCrmSetupStatus(message, state = "")')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup status setter test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup status setter test passed.");
