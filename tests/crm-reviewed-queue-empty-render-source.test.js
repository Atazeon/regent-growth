const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function renderReviewedCrmQueue(reviewedCrmLeads, showEmpty = false)");
const end = app.indexOf("const crmQueuePageSize", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["reviewed queue renderer exists", start !== -1],
  ["reviewed queue handles empty list", body.includes("if (reviewedCrmLeads.length === 0) {")],
  ["reviewed queue respects showEmpty", body.includes("return showEmpty")],
  ["reviewed queue empty container exists", body.includes('<div class="crm-reviewed-queue"><p class="empty-state">No reviewed CRM syncs parked. Mark failed syncs reviewed when they should not be retried yet.</p></div>')],
  ["reviewed queue hides empty block by default", body.includes(': "";')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed queue empty render test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed queue empty render test passed.");
