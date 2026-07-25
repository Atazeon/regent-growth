const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function requeueSelectedReviewedCrmSync()");
const end = app.indexOf("function downloadFile(filename, content, type)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["selected requeue function exists", start !== -1],
  ["selected requeue marks failed", body.includes('prospect.crmSyncStatus = "Sync Failed";')],
  ["selected requeue clears reason", body.includes('prospect.crmReviewedReason = "";')],
  ["selected requeue appends note", body.includes("Selected reviewed CRM retry requeued.")],
  ["selected requeue resets queue pages", body.includes('resetCrmQueuePages("all");')],
  ["selected requeue reports setup status", body.includes("setCrmSetupStatus(`${prospect.company} moved back to the CRM retry queue.`);")],
  ["selected requeue reports data status", body.includes("setDataStatus(`${prospect.company} is ready for CRM retry.`);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed selected requeue status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed selected requeue status test passed.");
