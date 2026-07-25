const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function renderReviewedCrmQueue(reviewedCrmLeads, showEmpty = false)");
const end = app.indexOf("const crmQueuePageSize", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["reviewed CRM queue renderer exists", start !== -1],
  ["reviewed renderer has empty parking guidance", body.includes("No reviewed CRM syncs parked.")],
  ["reviewed renderer pages results", body.includes("const reviewedPage = getBoundedPage(crmReviewedQueuePage, reviewedCrmLeads.length);")],
  ["reviewed renderer heading exists", body.includes("Reviewed CRM Syncs")],
  ["reviewed renderer has show reviewed action", body.includes('data-action="show-crm-reviewed"')],
  ["reviewed renderer shows latest note", body.includes("formatReviewedCrmSyncNote(prospect)")],
  ["reviewed renderer opens record", body.includes('data-action="open-crm-reviewed"')],
  ["reviewed renderer requeues one", body.includes('data-action="requeue-crm-reviewed-one"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`CRM reviewed queue e2e test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("CRM reviewed queue e2e test passed.");
