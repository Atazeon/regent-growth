const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["due summary element exists", html.includes('id="outboundImprovementDueSummary"')],
  ["due state helper exists", app.includes("function getOutboundImprovementDueState(item)")],
  ["due counts helper exists", app.includes("function getOutboundImprovementDueCounts(")],
  ["overdue state exists", app.includes('return "overdue"')],
  ["today state exists", app.includes('return "today"')],
  ["soon state exists", app.includes('return "soon"')],
  ["due summary renders", app.includes("outboundImprovementDueSummary.innerHTML")],
  ["article due state renders", app.includes('data-due-state="${escapeHtml(getOutboundImprovementDueState(item))}"')],
  ["due chips styled", css.includes(".outbound-improvement-due-summary")],
  ["README mentions due dashboard", readme.includes("due date dashboard")],
  ["plan next owner workload", plan.includes("- First run snapshot timeline polish")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements due dashboard test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements due dashboard test passed.");
