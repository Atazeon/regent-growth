const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["failed CRM saved view exists", html.includes('data-view="crm-failed"')],
  ["reviewed CRM saved view exists", html.includes('data-view="crm-reviewed"')],
  ["syncing CRM saved view exists", html.includes('data-view="crm-syncing"')],
  ["synced CRM saved view exists", html.includes('data-view="crm-synced"')],
  ["not synced CRM saved view exists", html.includes('data-view="crm-not-synced"')],
  ["show failed helper exists", app.includes("function showFailedCrmSyncs()")],
  ["show failed activates view", app.includes('savedViews.dataset.activeView = "crm-failed";')],
  ["show reviewed helper exists", app.includes("function showReviewedCrmSyncs()")],
  ["show reviewed activates view", app.includes('savedViews.dataset.activeView = "crm-reviewed";')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`CRM view shortcuts test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("CRM view shortcuts test passed.");
