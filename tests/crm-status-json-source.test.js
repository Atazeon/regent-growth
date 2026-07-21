const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["json summary button", html.includes('id="downloadCrmStatusJsonButton"')],
  ["button selector", app.includes('const downloadCrmStatusJsonButton = document.querySelector("#downloadCrmStatusJsonButton");')],
  ["record helper", app.includes("function getCrmStatusSummaryRecord()")],
  ["warm lead count", app.includes("warmLeadCount: warmLeads.length")],
  ["retryable count", app.includes("retryableFailedCount: failedCrmLeads.filter((prospect) => isWarmLead(prospect)).length")],
  ["failure reasons", app.includes("failureReasons: getCrmFailureReasonCounts(failedCrmLeads)")],
  ["failed queue sample", app.includes("failedQueue: failedCrmLeads.slice(0, 10).map(getCrmRecord)")],
  ["reviewed queue sample", app.includes("reviewedQueue: reviewedCrmLeads.slice(0, 10).map(getCrmRecord)")],
  ["download function", app.includes("function downloadCrmStatusJson()")],
  ["json download", app.includes("JSON.stringify(getCrmStatusSummaryRecord(), null, 2)")],
  ["click listener", app.includes('downloadCrmStatusJsonButton.addEventListener("click", downloadCrmStatusJson);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM status JSON test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM status JSON test passed.");
