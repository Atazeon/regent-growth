const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["outcome batch filter exists", html.includes('id="outboundOutcomeBatchFilter"')],
  ["outcome batch filter all option exists", html.includes('<option value="all">All batches</option>')],
  ["outcome batch filter second option exists", html.includes('<option value="Second Batch">Second Batch</option>')],
  ["outcome batch filter state exists", app.includes('let outboundOutcomeBatchFilterValue = "all"')],
  ["outcome batch filter selector exists", app.includes('const outboundOutcomeBatchFilter = document.querySelector("#outboundOutcomeBatchFilter")')],
  ["outcome visible filter exists", app.includes("function getVisibleOutboundOutcomes()") && app.includes('outboundOutcomeBatchFilterValue === "all"')],
  ["outcome filter value rendered", app.includes("outboundOutcomeBatchFilter.value = outboundOutcomeBatchFilterValue")],
  ["outcome filtered summary exists", app.includes("${visibleOutcomes.length} of ${outcomes.length} outcome")],
  ["outcome filtered empty state exists", app.includes("No outcomes match this batch filter.")],
  ["outcome filter listener exists", app.includes('outboundOutcomeBatchFilter.addEventListener("change"')],
  ["README mentions dashboard filters", readme.includes("dashboard filters")],
  ["plan next filtered exports", plan.includes("- Outbound operating QA pass")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound operating QA pass test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound operating QA pass test passed.");
