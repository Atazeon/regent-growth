const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["retry hint helper exists", app.includes("function updateCrmRetryActionHints(failedCrmLeads, filteredFailedCrmLeads, reviewedCrmLeads)")],
  ["retry helper uses filtered label", app.includes('const filteredLabel = crmFailureReasonFilter === "all" ? "failed CRM syncs" : `${crmFailureReasonFilter} CRM sync failures`;')],
  ["retry running hint used", app.includes('const runningHint = "CRM sync is already running";')],
  ["retry button gets hint", app.includes("setCrmActionHint(\n    retryFailedCrmButton,")],
  ["review button gets hint", app.includes("setCrmActionHint(\n    markReviewedCrmButton,")],
  ["requeue reviewed gets hint", app.includes("setCrmActionHint(\n    requeueReviewedCrmButton,")],
  ["failed json export gets hint", app.includes("setCrmActionHint(\n    exportFailedCrmButton,")],
  ["failed csv export gets hint", app.includes("setCrmActionHint(\n    exportFailedCrmCsvButton,")],
  ["reviewed json export gets hint", app.includes("setCrmActionHint(\n    exportReviewedCrmButton,")],
  ["reviewed csv export gets hint", app.includes("setCrmActionHint(\n    exportReviewedCrmCsvButton,")],
  ["render retry queue uses helper", app.includes("updateCrmRetryActionHints(failedCrmLeads, filteredFailedCrmLeads, reviewedCrmLeads);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM retry action hints test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM retry action hints test passed.");
