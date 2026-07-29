const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["owner filter exists", html.includes('id="outboundImprovementOwnerFilter"')],
  ["owner filter state exists", app.includes('let outboundImprovementOwnerFilterValue = "all"')],
  ["owners helper exists", app.includes("function getOutboundImprovementOwners(")],
  ["visible helper filters owner", app.includes('(item.owner || "Unassigned") === outboundImprovementOwnerFilterValue')],
  ["owner options render", app.includes("outboundImprovementOwnerFilter.innerHTML")],
  ["owner listener exists", app.includes('outboundImprovementOwnerFilter.addEventListener("change"')],
  ["README mentions owner filter", readme.includes("owner filter")],
  ["plan next owner export", plan.includes("- First run snapshot filter reset")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements owner filter test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements owner filter test passed.");
