const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function syncWarmCrmLeads()");
const end = app.indexOf("async function retryFailedCrmSyncs()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["warm sync function exists", start !== -1],
  ["warm sync sets in-progress flag", body.includes("crmSyncInProgress = true;")],
  ["warm sync reports working status", body.includes("setCrmSetupStatus(`Syncing ${warmLeads.length} warm lead${warmLeads.length === 1 ? \"\" : \"s\"} to CRM...`, \"working\");")],
  ["warm sync maps records", body.includes("await syncCrmRecords(warmLeads.map(getCrmRecord), warmLeads);")],
  ["warm sync reports setup success", body.includes("setCrmSetupStatus(`Synced ${warmLeads.length} warm lead${warmLeads.length === 1 ? \"\" : \"s\"} to CRM.`);")],
  ["warm sync reports data success", body.includes("setDataStatus(`Synced ${warmLeads.length} warm lead${warmLeads.length === 1 ? \"\" : \"s\"} to CRM.`);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM warm sync status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM warm sync status test passed.");
