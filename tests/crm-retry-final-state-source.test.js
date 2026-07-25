const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const bulkStart = app.indexOf("async function retryFailedCrmSyncs()");
const bulkEnd = app.indexOf("function showFailedCrmSyncs()", bulkStart);
const singleStart = app.indexOf("async function retrySingleFailedCrmSync(index)");
const singleEnd = app.indexOf("async function copySelectedHandoffPacket()", singleStart);
const bulkBody = bulkStart === -1 || bulkEnd === -1 ? "" : app.slice(bulkStart, bulkEnd);
const singleBody = singleStart === -1 || singleEnd === -1 ? "" : app.slice(singleStart, singleEnd);

const checks = [
  ["bulk retry function exists", bulkStart !== -1],
  ["single retry function exists", singleStart !== -1],
  ["bulk retry clears in-progress flag", bulkBody.includes("crmSyncInProgress = false;")],
  ["bulk retry recalculates disabled state", bulkBody.includes("retryFailedCrmButton.disabled = filterCrmLeadsByReason(getFailedCrmSyncLeads()).length === 0;")],
  ["bulk retry refreshes action hints", bulkBody.includes("updateCrmSyncActionHints();")],
  ["single retry clears in-progress flag", singleBody.includes("crmSyncInProgress = false;")],
  ["single retry refreshes handoff", singleBody.includes("renderHandoff();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM retry final state test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM retry final state test passed.");
