const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["renders area options", app.includes("outboundSessionAreaFilter.innerHTML") && app.includes("getOutboundSessionAreas().map")],
  ["renders next action", app.includes("outboundSessionNextAction.innerHTML")],
  ["filters visible items", app.includes("const visibleItems = getVisibleOutboundSessionItems()")],
  ["disables next complete", app.includes("focusNextOutboundStepButton.disabled = !nextItem")],
  ["disables complete visible", app.includes("completeVisibleOutboundStepsButton.disabled = visibleItems.length === 0 || visibleIncompleteCount === 0")],
  ["renders step ids", app.includes('data-step-id="${escapeHtml(item.id)}"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound session refinement render test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound session refinement render test passed.");
