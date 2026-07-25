const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function requeueSelectedReviewedCrmSync()");
const end = app.indexOf("function downloadFile(filename, content, type)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["selected requeue function exists", start !== -1],
  ["selected requeue guards missing selection", body.includes('"Select a reviewed CRM sync before requeueing one record."')],
  ["selected requeue guards non-reviewed record", body.includes("if (prospect.crmSyncStatus !== \"Retry Reviewed\") {")],
  ["selected requeue reports non-reviewed record", body.includes("`${prospect.company} is not marked CRM reviewed.`")],
  ["selected requeue guards cold prospect", body.includes("if (!isWarmLead(prospect)) {")],
  ["selected requeue reports cold prospect", body.includes("`${prospect.company} is not warm/CRM-ready. Mark it CRM ready before requeueing.`")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed selected requeue guard test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed selected requeue guard test passed.");
