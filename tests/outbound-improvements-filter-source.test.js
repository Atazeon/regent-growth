const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["status filter exists", html.includes('id="outboundImprovementStatusFilter"')],
  ["status filter options exist", html.includes('<option value="In Progress">In Progress</option>') && html.includes('<option value="Resolved">Resolved</option>')],
  ["filter state exists", app.includes('let outboundImprovementStatusFilterValue = "all"')],
  ["visible helper exists", app.includes("function getVisibleOutboundImprovementItems()")],
  ["filter listener exists", app.includes('outboundImprovementStatusFilter.addEventListener("change"')],
  ["filtered empty state exists", app.includes("No fixes match this status filter.")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements filter test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements filter test passed.");
