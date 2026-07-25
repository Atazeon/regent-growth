const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function requeueSingleReviewedCrmSync(index)");
const end = app.indexOf("async function retrySingleFailedCrmSync(index)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["panel requeue function exists", start !== -1],
  ["panel requeue guards non-reviewed record", body.includes('if (!prospect || prospect.crmSyncStatus !== "Retry Reviewed") {')],
  ["panel requeue guards cold prospect", body.includes("if (!isWarmLead(prospect)) {")],
  ["panel requeue marks failed", body.includes('prospect.crmSyncStatus = "Sync Failed";')],
  ["panel requeue clears reviewed reason", body.includes('prospect.crmReviewedReason = "";')],
  ["panel requeue appends panel note", body.includes("Reviewed CRM retry requeued from the retry panel.")],
  ["panel requeue reports setup status", body.includes("setCrmSetupStatus(`${prospect.company} moved back to the CRM retry queue.`);")],
  ["panel requeue reports data status", body.includes("setDataStatus(`${prospect.company} is ready for CRM retry.`);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed panel requeue test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed panel requeue test passed.");
