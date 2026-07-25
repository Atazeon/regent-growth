const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["CRM status element exists", html.includes('id="crmSetupStatus"')],
  ["CRM preset select exists", html.includes('id="crmPresetSelect"')],
  ["check setup button exists", html.includes('id="checkCrmSetupButton"')],
  ["sync selected button exists", html.includes('id="syncSelectedCrmButton"')],
  ["sync warm button exists", html.includes('id="syncWarmCrmButton"')],
  ["retry failed button starts disabled", html.includes('id="retryFailedCrmButton"') && html.includes("Retry failed") && html.includes("disabled")],
  ["CRM retry queue region exists", html.includes('id="crmRetryQueue"')],
  ["check setup listener exists", app.includes('checkCrmSetupButton.addEventListener("click", checkCrmSetup);')],
  ["sync selected listener exists", app.includes('syncSelectedCrmButton.addEventListener("click", syncSelectedCrmLead);')],
  ["sync warm listener exists", app.includes('syncWarmCrmButton.addEventListener("click", syncWarmCrmLeads);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`CRM setup controls browser test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("CRM setup controls browser test passed.");
