const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["reviewed queue accepts empty option", app.includes("function renderReviewedCrmQueue(reviewedCrmLeads, showEmpty = false)")],
  ["reviewed empty guidance exists", app.includes("No reviewed CRM syncs parked. Mark failed syncs reviewed when they should not be retried yet.")],
  ["empty guidance is optional", app.includes('return showEmpty\n      ? `<div class="crm-reviewed-queue"><p class="empty-state">No reviewed CRM syncs parked. Mark failed syncs reviewed when they should not be retried yet.</p></div>`\n      : "";')],
  ["no failed branch shows reviewed empty", app.includes("${renderReviewedCrmQueue(reviewedCrmLeads, true)}")],
  ["regular reviewed render remains", app.includes('${renderReviewedCrmQueue(reviewedCrmLeads)}')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed empty-state test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed empty-state test passed.");
