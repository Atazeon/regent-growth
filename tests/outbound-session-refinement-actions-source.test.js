const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["area state exists", app.includes('let outboundSessionAreaFilterValue = "all"')],
  ["area helper exists", app.includes("function getOutboundSessionAreas()")],
  ["visible helper exists", app.includes("function getVisibleOutboundSessionItems()")],
  ["next helper exists", app.includes("function getNextOutboundSessionItem()")],
  ["focus next exists", app.includes("function focusNextOutboundStep()")],
  ["complete visible exists", app.includes("function completeVisibleOutboundSteps()")],
  ["area change bound", app.includes('outboundSessionAreaFilter.addEventListener("change"')],
  ["complete visible bound", app.includes('completeVisibleOutboundStepsButton.addEventListener("click", completeVisibleOutboundSteps)')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound session refinement actions test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound session refinement actions test passed.");
