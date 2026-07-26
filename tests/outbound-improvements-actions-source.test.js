const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["items helper exists", app.includes("function getOutboundImprovementItems()")],
  ["counts helper exists", app.includes("function getOutboundImprovementCounts(")],
  ["render helper exists", app.includes("function renderOutboundImprovementQueue()")],
  ["status setter exists", app.includes("function setOutboundImprovementStatus(id, status)")],
  ["copy helper exists", app.includes("function copyOutboundImprovementSummary()")],
  ["download helper exists", app.includes("function downloadOutboundImprovementSummary()")],
  ["status dropdown bound", app.includes("set-outbound-improvement-status")],
  ["copy bound", app.includes('copyOutboundImprovementsButton.addEventListener("click", copyOutboundImprovementSummary)')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements actions test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements actions test passed.");
