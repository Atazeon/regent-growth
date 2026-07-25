const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function syncSelectedCrmLead()");
const end = app.indexOf("async function syncWarmCrmLeads()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["selected sync function exists", start !== -1],
  ["selected sync reads selected prospect", body.includes("const prospect = getSelectedProspect();")],
  ["selected sync guards missing or cold prospect", body.includes("if (!prospect || !isWarmLead(prospect)) {")],
  ["selected sync explains guard failure", body.includes('"Select or mark a warm lead before syncing the selected account."')],
  ["selected sync guard uses error state", body.includes('setCrmSetupStatus("Select or mark a warm lead before syncing the selected account.", "error");')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM selected sync guard test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM selected sync guard test passed.");
