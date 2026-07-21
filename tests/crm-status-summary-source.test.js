const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["summary function", app.includes("function formatCrmStatusSummary()")],
  ["warm leads count", app.includes("const warmLeads = getWarmLeads();")],
  ["retryable failed count", app.includes("const retryableFailedCount = failedCrmLeads.filter((prospect) => isWarmLead(prospect)).length;")],
  ["warm leads line", app.includes("Warm Leads: ${warmLeads.length}")],
  ["retryable failed line", app.includes("Retryable Failed: ${retryableFailedCount}")],
  ["failed line retained", app.includes("Failed: ${failedCrmLeads.length}")],
  ["reviewed line retained", app.includes("Reviewed: ${reviewedCrmLeads.length}")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM status summary test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM status summary test passed.");
