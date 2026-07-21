const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["warm lead warning is alert", app.includes('<p class="crm-preview-warning" role="alert">This account is not a warm lead yet. Mark it CRM ready before syncing.</p>')],
  ["warm lead condition retained", app.includes("const warmLeadWarning = isWarmLead(prospect)\n    ? \"\"")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM field preview warning label test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM field preview warning label test passed.");
