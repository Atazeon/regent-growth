const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function renderReviewedCrmQueue(reviewedCrmLeads, showEmpty = false)");
const end = app.indexOf("const crmQueuePageSize", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["reviewed queue renderer exists", start !== -1],
  ["reviewed queue heading exists", body.includes("Reviewed CRM Syncs")],
  ["reviewed count heading exists", body.includes("${escapeHtml(reviewedCrmLeads.length)} reviewed sync")],
  ["reviewed note preview exists", body.includes('previewText(formatReviewedCrmSyncNote(prospect), "No review note recorded.")')],
  ["open reviewed action exists", body.includes('data-action="open-crm-reviewed"')],
  ["requeue reviewed action exists", body.includes('data-action="requeue-crm-reviewed-one"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed queue list render test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed queue list render test passed.");
