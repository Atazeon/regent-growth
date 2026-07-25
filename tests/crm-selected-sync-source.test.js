const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function syncSelectedCrmLead()");
const end = app.indexOf("async function syncWarmCrmLeads()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["selected CRM sync helper exists", start !== -1],
  ["selected sync reads selected prospect", body.includes("const prospect = getSelectedProspect();")],
  ["selected sync guards non-warm lead", body.includes("if (!prospect || !isWarmLead(prospect))")],
  ["selected sync sets progress", body.includes("crmSyncInProgress = true;")],
  ["selected sync updates hints", body.includes("updateCrmSyncActionHints();")],
  ["selected sync calls single-record sync", body.includes("await syncCrmRecords([getCrmRecord(prospect)], [prospect]);")],
  ["selected sync marks failure", body.includes('prospect.crmSyncStatus = "Sync Failed";')],
  ["selected sync appends failure note", body.includes("appendCrmSyncNote(prospect, `${new Date().toISOString()}: ${error.message}`);")],
  ["selected sync clears progress", body.includes("crmSyncInProgress = false;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`CRM selected sync test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("CRM selected sync test passed.");
