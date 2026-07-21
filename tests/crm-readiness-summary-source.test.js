const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["crm readiness helper", app.includes("function renderSelectedCrmReadiness(prospect)")],
  ["uses warm lead rule", app.includes("if (!isWarmLead(prospect))")],
  ["not ready text", app.includes("Not CRM ready yet. Move the account to Interested, Meeting, or Assessment first.")],
  ["sync status", app.includes('const syncStatus = prospect.crmSyncStatus || "Not Synced";')],
  ["owner included", app.includes('const ownerText = prospect.handoffOwner ? ` | Owner: ${prospect.handoffOwner}` : "";')],
  ["ready text", app.includes("CRM ready | Sync: ${syncStatus}${ownerText}")],
  ["detail card", app.includes("<span>CRM Readiness</span>")],
  ["detail render", app.includes("escapeHtml(renderSelectedCrmReadiness(prospect))")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM readiness summary test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM readiness summary test passed.");
