const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function renderCrmRetryQueue(failedCrmLeads = getFailedCrmSyncLeads())");
const end = app.indexOf("function renderReviewedCrmQueue", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["CRM retry renderer exists", start !== -1],
  ["retry renderer gets reviewed leads", body.includes("const reviewedCrmLeads = getReviewedCrmSyncLeads();")],
  ["retry renderer filters failures", body.includes("const filteredFailedCrmLeads = filterCrmLeadsByReason(failedCrmLeads);")],
  ["retry renderer updates action hints", body.includes("updateCrmRetryActionHints(failedCrmLeads, filteredFailedCrmLeads, reviewedCrmLeads);")],
  ["retry renderer counts synced", body.includes('prospects.filter((prospect) => prospect.crmSyncStatus === "Synced").length')],
  ["retry renderer shows no failed syncs", body.includes("<h3>No failed syncs</h3>")],
  ["retry renderer renders status chips", body.includes("renderCrmSyncStatusChips(")],
  ["retry renderer shows reviewed queue", body.includes("renderReviewedCrmQueue(reviewedCrmLeads, true)")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`CRM retry queue empty test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("CRM retry queue empty test passed.");
