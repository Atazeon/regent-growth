const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function syncWarmCrmLeads()");
const end = app.indexOf("async function retryFailedCrmSyncs()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["warm sync function exists", start !== -1],
  ["warm sync reads warm leads", body.includes("const warmLeads = getWarmLeads();")],
  ["warm sync guards empty warm leads", body.includes("if (warmLeads.length === 0) {")],
  ["warm sync explains empty state", body.includes('"No warm leads to sync yet."')],
  ["warm sync empty state is error", body.includes('setCrmSetupStatus("No warm leads to sync yet.", "error");')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM warm sync guard test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM warm sync guard test passed.");
