const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function syncWarmCrmLeads()");
const end = app.indexOf("async function retryFailedCrmSyncs()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["warm CRM sync helper exists", start !== -1],
  ["warm sync reads warm leads", body.includes("const warmLeads = getWarmLeads();")],
  ["warm sync guards empty list", body.includes("No warm leads to sync yet.")],
  ["warm sync sets progress", body.includes("crmSyncInProgress = true;")],
  ["warm sync syncs mapped records", body.includes("await syncCrmRecords(warmLeads.map(getCrmRecord), warmLeads);")],
  ["warm sync reports CRM status", body.includes("Synced ${warmLeads.length} warm lead")],
  ["warm sync records shared failure timestamp", body.includes("const failedAt = new Date().toISOString();")],
  ["warm sync marks failures", body.includes('prospect.crmSyncStatus = "Sync Failed";')],
  ["warm sync appends failure note", body.includes("appendCrmSyncNote(prospect, `${failedAt}: ${error.message}`);")],
  ["warm sync clears progress", body.includes("crmSyncInProgress = false;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`CRM warm sync test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("CRM warm sync test passed.");
