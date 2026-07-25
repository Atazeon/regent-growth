const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["sales metrics region labelled", html.includes('aria-label="Sales engine metrics"')],
  ["dashboard summary region labelled", html.includes('aria-label="Dashboard summary"')],
  ["CRM retry queue region labelled", html.includes('aria-label="CRM retry queue"')],
  ["email send summary live region exists", html.includes('id="emailSendSummary"') && html.includes('aria-live="polite"')],
  ["daily run log live region exists", html.includes('id="dailyRunLog"') && html.includes('aria-live="polite"')],
  ["CRM setup buttons have aria labels", html.includes('aria-label="Check CRM API connection settings"')],
  ["email handoff buttons have aria labels", html.includes('aria-label="Open this draft in Gmail compose"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product accessibility regions test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product accessibility regions test passed.");
