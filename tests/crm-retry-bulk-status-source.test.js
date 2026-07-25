const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function retryFailedCrmSyncs()");
const end = app.indexOf("function showFailedCrmSyncs()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["bulk retry function exists", start !== -1],
  ["bulk retry disables retry button", body.includes("retryFailedCrmButton.disabled = true;")],
  ["bulk retry sets in-progress flag", body.includes("crmSyncInProgress = true;")],
  ["bulk retry reports working status", body.includes("setCrmSetupStatus(`Retrying ${failedCrmLeads.length}${filterLabel} failed CRM sync${failedCrmLeads.length === 1 ? \"\" : \"s\"}...`, \"working\");")],
  ["bulk retry syncs failed records", body.includes("await syncCrmRecords(failedCrmLeads.map(getCrmRecord), failedCrmLeads);")],
  ["bulk retry reports setup success", body.includes("setCrmSetupStatus(`Retried and synced ${failedCrmLeads.length}${filterLabel} failed CRM record${failedCrmLeads.length === 1 ? \"\" : \"s\"}.`);")],
  ["bulk retry reports data success", body.includes("setDataStatus(`CRM retry queue cleared for ${failedCrmLeads.length}${filterLabel} warm lead${failedCrmLeads.length === 1 ? \"\" : \"s\"}.`);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM retry bulk status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM retry bulk status test passed.");
