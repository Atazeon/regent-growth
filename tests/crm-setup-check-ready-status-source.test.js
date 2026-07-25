const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function checkCrmSetup()");
const end = app.indexOf("async function syncCrmRecords(", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["check CRM setup function exists", start !== -1],
  ["status JSON is parsed", body.includes("const status = await response.json();")],
  ["ready state checks configured and valid", body.includes("const ready = status.configured && status.valid !== false;")],
  ["ready status includes endpoint", body.includes('`CRM connector ready: ${status.endpoint}${status.keyConfigured ? " with API key" : " without API key"}.`')],
  ["ready status is non-error", body.includes('ready ? "" : "error"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup check ready status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup check ready status test passed.");
