const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["title remains Regent Growth", html.includes("<title>Regent Growth</title>")],
  ["model selector exists", html.includes('id="modelSelect"')],
  ["Daily AI button exists", html.includes('id="runDailyAiButton"')],
  ["prospect list exists", html.includes('id="prospectList"')],
  ["detail panel exists", html.includes('id="selectedDetail"')],
  ["email draft exists", html.includes('id="emailDraft"')],
  ["CRM retry queue exists", html.includes('id="crmRetryQueue"')],
  ["team sync status exists", html.includes('id="teamSyncStatus"')],
  ["reminder list exists", html.includes('id="reminderList"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance browser smoke contract test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance browser smoke contract test passed.");
