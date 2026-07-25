const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function checkCrmSetup()");
const end = app.indexOf("async function syncCrmRecords(", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);
const workingIndex = body.indexOf('setCrmSetupStatus("Checking CRM connector...", "working");');
const fetchIndex = body.indexOf("const response = await fetch(crmStatusEndpoint);");

const checks = [
  ["check CRM setup function exists", start !== -1],
  ["working status is set", workingIndex !== -1],
  ["crm status endpoint is fetched", fetchIndex !== -1],
  ["working status set before fetch", workingIndex !== -1 && fetchIndex !== -1 && workingIndex < fetchIndex]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup check working status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup check working status test passed.");
