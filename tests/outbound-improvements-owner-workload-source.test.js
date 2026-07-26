const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["owner summary element exists", html.includes('id="outboundImprovementOwnerSummary"')],
  ["owner counts helper exists", app.includes("function getOutboundImprovementOwnerCounts(")],
  ["unassigned fallback exists", app.includes('const owner = item.owner || "Unassigned"')],
  ["owner summary renders", app.includes("outboundImprovementOwnerSummary.innerHTML")],
  ["owner chips sort", app.includes(".sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))")],
  ["owner chips styled", css.includes(".outbound-improvement-owner-summary")],
  ["README mentions owner workload", readme.includes("owner workload")],
  ["plan next owner filter", plan.includes("- Fix queue closeout download")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements owner workload test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements owner workload test passed.");
