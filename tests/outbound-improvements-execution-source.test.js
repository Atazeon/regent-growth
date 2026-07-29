const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["items include owner", app.includes('owner: outboundSessionState.improvements[outcome.id]?.owner || ""')],
  ["items include due", app.includes('due: outboundSessionState.improvements[outcome.id]?.due || ""')],
  ["items include execution note", app.includes('executionNote: outboundSessionState.improvements[outcome.id]?.executionNote || ""')],
  ["field setter exists", app.includes("function setOutboundImprovementField(id, field, value)")],
  ["owner input rendered", app.includes('data-action="set-outbound-improvement-owner"')],
  ["due input rendered", app.includes('data-action="set-outbound-improvement-due"')],
  ["note textarea rendered", app.includes('data-action="set-outbound-improvement-note"')],
  ["exports owner", app.includes('Owner: ${item.owner || "Unassigned"}')],
  ["exports execution note", app.includes('Execution: ${item.executionNote || "No execution note yet."}')],
  ["execution CSS exists", css.includes(".outbound-improvement-execution")],
  ["README mentions execution notes", readme.includes("owner") && readme.includes("execution notes")],
  ["plan next dashboard", plan.includes("- First run snapshot unknown readiness")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements execution test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements execution test passed.");
