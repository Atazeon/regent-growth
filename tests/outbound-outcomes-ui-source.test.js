const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["outcome form exists", html.includes('id="outboundOutcomeForm"')],
  ["outcome type exists", html.includes('id="outboundOutcomeType"')],
  ["outcome company exists", html.includes('id="outboundOutcomeCompany"')],
  ["outcome note exists", html.includes('id="outboundOutcomeNote"')],
  ["outcome summary exists", html.includes('id="outboundOutcomeSummary"')],
  ["outcome list exists", html.includes('id="outboundOutcomeList"')],
  ["copy outcomes exists", html.includes('id="copyOutboundOutcomesButton"')],
  ["download outcomes exists", html.includes('id="downloadOutboundOutcomesButton"')],
  ["clear outcomes exists", html.includes('id="clearOutboundOutcomesButton"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound outcomes UI test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound outcomes UI test passed.");
