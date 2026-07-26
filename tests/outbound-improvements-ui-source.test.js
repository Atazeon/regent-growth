const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["improvement summary exists", html.includes('id="outboundImprovementSummary"')],
  ["improvement queue exists", html.includes('id="outboundImprovementQueue"')],
  ["copy fixes exists", html.includes('id="copyOutboundImprovementsButton"')],
  ["download fixes exists", html.includes('id="downloadOutboundImprovementsButton"')],
  ["queue heading exists", html.includes("Improvement Queue")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements UI test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements UI test passed.");
