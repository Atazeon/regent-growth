const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["render exists", app.includes("function renderOutboundOutcomes()")],
  ["counts exists", app.includes("function getOutboundOutcomeCounts()")],
  ["add exists", app.includes("function addOutboundOutcome(event)")],
  ["remove exists", app.includes("function removeOutboundOutcome(id)")],
  ["copy exists", app.includes("function copyOutboundOutcomeSummary()")],
  ["download exists", app.includes("function downloadOutboundOutcomeSummary()")],
  ["clear exists", app.includes("function clearOutboundOutcomes()")],
  ["form bound", app.includes('outboundOutcomeForm.addEventListener("submit", addOutboundOutcome)')],
  ["remove bound", app.includes("delete-outbound-outcome")],
  ["outcome controls bound", app.includes('copyOutboundOutcomesButton.addEventListener("click", copyOutboundOutcomeSummary)')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound outcomes actions test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound outcomes actions test passed.");
