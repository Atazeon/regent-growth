const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function markFailedCrmSyncsReviewed()");
const end = app.indexOf("function requeueReviewedCrmSyncs()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["mark reviewed function exists", start !== -1],
  ["mark reviewed records timestamp", body.includes("const reviewedAt = new Date().toISOString();")],
  ["mark reviewed sets reviewed status", body.includes('prospect.crmSyncStatus = "Retry Reviewed";')],
  ["mark reviewed stores reason", body.includes("prospect.crmReviewedReason = reason;")],
  ["mark reviewed appends note", body.includes("CRM retry failure reviewed as ${reason}; no automatic retry queued.")],
  ["mark reviewed reports setup status", body.includes("setCrmSetupStatus(`Marked ${failedCrmLeads.length}${filterLabel} failed CRM sync${failedCrmLeads.length === 1 ? \"\" : \"s\"} reviewed.`);")],
  ["mark reviewed reports data status", body.includes('setDataStatus("Reviewed CRM failures are preserved in the CRM Reviewed view.");')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed mark status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed mark status test passed.");
