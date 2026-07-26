const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["open copy button exists", html.includes('id="copyOpenOutboundImprovementsButton"')],
  ["open formatter exists", app.includes("function formatOpenOutboundImprovementSummary()")],
  ["open copy exists", app.includes("function copyOpenOutboundImprovementSummary()")],
  ["open copy bound", app.includes('copyOpenOutboundImprovementsButton.addEventListener("click", copyOpenOutboundImprovementSummary)')],
  ["open copy disables", app.includes("copyOpenOutboundImprovementsButton.disabled = openItems.length === 0")],
  ["open copy status", app.includes("Copied open outcome-driven fixes.")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements open-copy test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements open-copy test passed.");
