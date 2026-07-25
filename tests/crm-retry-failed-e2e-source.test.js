const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function retryFailedCrmSyncs()");
const end = app.indexOf("function showFailedCrmSyncs()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["retry failed helper exists", start !== -1],
  ["retry failed reads failed leads", body.includes("const allFailedCrmLeads = getFailedCrmSyncLeads();")],
  ["retry failed respects reason filter", body.includes("const failedCrmLeads = filterCrmLeadsByReason(allFailedCrmLeads);")],
  ["retry failed guards empty queue", body.includes("No failed CRM syncs to retry.")],
  ["retry failed disables retry button", body.includes("retryFailedCrmButton.disabled = true;")],
  ["retry failed sets progress", body.includes("crmSyncInProgress = true;")],
  ["retry failed syncs mapped records", body.includes("await syncCrmRecords(failedCrmLeads.map(getCrmRecord), failedCrmLeads);")],
  ["retry failed appends retry failure note", body.includes("Retry failed: ${error.message}")],
  ["retry failed refreshes hints", body.includes("updateCrmSyncActionHints();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`CRM retry failed e2e test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("CRM retry failed e2e test passed.");
