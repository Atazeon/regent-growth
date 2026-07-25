const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function updateCrmRetryActionHints(failedCrmLeads, filteredFailedCrmLeads, reviewedCrmLeads)");
const end = app.indexOf("function updateSelectedReviewedCrmActionHint", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["retry action hints function exists", start !== -1],
  ["reviewed count calculated", body.includes("const reviewedCount = reviewedCrmLeads.length;")],
  ["requeue reviewed button is managed", body.includes("requeueReviewedCrmButton,")],
  ["requeue reviewed disabled when running or empty", body.includes("crmSyncInProgress || reviewedCount === 0,")],
  ["requeue reviewed running hint exists", body.includes("? runningHint")],
  ["requeue reviewed count hint exists", body.includes("? `Requeue ${reviewedCount} reviewed CRM syncs`")],
  ["requeue reviewed empty hint exists", body.includes(': "No reviewed CRM syncs to requeue"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed queue action hint test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed queue action hint test passed.");
