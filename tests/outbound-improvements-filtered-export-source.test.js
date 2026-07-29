const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["filtered copy button exists", html.includes('id="copyFilteredOutboundImprovementsButton"')],
  ["filtered formatter exists", app.includes("function formatFilteredOutboundImprovementSummary()")],
  ["filtered copy exists", app.includes("function copyFilteredOutboundImprovementSummary()")],
  ["filtered copy bound", app.includes('copyFilteredOutboundImprovementsButton.addEventListener("click", copyFilteredOutboundImprovementSummary)')],
  ["filtered copy disables", app.includes("copyFilteredOutboundImprovementsButton.disabled = visibleItems.length === 0")],
  ["formatter includes status", app.includes("Status: ${statusLabel}")],
  ["formatter includes owner", app.includes("Owner: ${ownerLabel}")],
  ["README mentions filtered copy", readme.includes("filtered copy")],
  ["plan next snapshot clear", plan.includes("- First run snapshot delete")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements filtered export test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements filtered export test passed.");
