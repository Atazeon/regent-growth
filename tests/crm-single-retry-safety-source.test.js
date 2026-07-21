const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function retrySingleFailedCrmSync(index)");
const end = app.indexOf("async function copySelectedHandoffPacket()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["single retry function exists", start !== -1],
  ["single retry sets sync progress", body.includes("crmSyncInProgress = true;\n  updateCrmSyncActionHints();\n  renderHandoff();")],
  ["single retry clears sync progress", body.includes("crmSyncInProgress = false;\n    updateCrmSyncActionHints();\n    renderHandoff();")],
  ["single retry no manual sync enable", !body.includes("syncWarmCrmButton.disabled = false;")],
  ["single retry no manual selected enable", !body.includes("syncSelectedCrmButton.disabled = false;")],
  ["single retry no manual retry restore", !body.includes("retryFailedCrmButton.disabled = getFailedCrmSyncLeads().length === 0;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM single retry safety test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM single retry safety test passed.");
