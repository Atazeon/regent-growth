const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function requeueReviewedCrmSyncs()");
const end = app.indexOf("function requeueSelectedReviewedCrmSync()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["requeue reviewed function exists", start !== -1],
  ["requeue reviewed records timestamp", body.includes("const requeuedAt = new Date().toISOString();")],
  ["requeue reviewed marks failed", body.includes('prospect.crmSyncStatus = "Sync Failed";')],
  ["requeue reviewed clears reason", body.includes('prospect.crmReviewedReason = "";')],
  ["requeue reviewed appends note", body.includes("Reviewed CRM retry requeued for automatic retry.")],
  ["requeue reviewed reports setup status", body.includes("setCrmSetupStatus(`Requeued ${reviewedCrmLeads.length} reviewed CRM sync${reviewedCrmLeads.length === 1 ? \"\" : \"s\"}.`);")],
  ["requeue reviewed reports data status", body.includes('setDataStatus("Reviewed CRM syncs moved back to the failed retry queue.");')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed requeue status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed requeue status test passed.");
