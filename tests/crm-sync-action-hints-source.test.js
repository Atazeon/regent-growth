const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["sync progress flag exists", app.includes("let crmSyncInProgress = false;")],
  ["button hint helper exists", app.includes("function setCrmSyncButtonHint(button, disabled, hint)")],
  ["sync hint helper exists", app.includes("function updateCrmSyncActionHints()")],
  ["running hint used", app.includes('"CRM sync is already running"')],
  ["selected missing hint used", app.includes('"Select or mark a warm lead before syncing the selected account"')],
  ["warm missing hint used", app.includes('"Mark at least one warm lead CRM ready before syncing all warm leads"')],
  ["render handoff refreshes hints", app.includes("handoffForm.hidden = !selectedProspect;\n  updateCrmSyncActionHints();")],
  ["selected sync sets progress", app.includes("crmSyncInProgress = true;\n  updateCrmSyncActionHints();\n  setCrmSetupStatus(`Syncing ${prospect.company} to CRM...`")],
  ["bulk sync sets progress", app.includes("crmSyncInProgress = true;\n  updateCrmSyncActionHints();\n  setCrmSetupStatus(`Syncing ${warmLeads.length} warm lead")],
  ["retry sync sets progress", app.includes("retryFailedCrmButton.disabled = true;\n  crmSyncInProgress = true;\n  updateCrmSyncActionHints();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM sync action hints test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM sync action hints test passed.");
