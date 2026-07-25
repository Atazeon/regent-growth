const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function syncSelectedCrmLead()");
const end = app.indexOf("async function syncWarmCrmLeads()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["selected sync function exists", start !== -1],
  ["selected sync sets in-progress flag", body.includes("crmSyncInProgress = true;")],
  ["selected sync refreshes action hints", body.includes("updateCrmSyncActionHints();")],
  ["selected sync reports working status", body.includes("setCrmSetupStatus(`Syncing ${prospect.company} to CRM...`, \"working\");")],
  ["selected sync calls CRM records sync", body.includes("await syncCrmRecords([getCrmRecord(prospect)], [prospect]);")],
  ["selected sync reports success", body.includes("setCrmSetupStatus(`${prospect.company} synced to CRM.`);")],
  ["selected sync reports data status", body.includes("setDataStatus(`${prospect.company} synced to CRM.`);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM selected sync status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM selected sync status test passed.");
