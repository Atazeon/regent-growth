const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["overdue field", app.includes("overdue: 0,")],
  ["overdue count", app.includes("if (prospect.handoffDue && daysUntil(prospect.handoffDue) < 0) workload.overdue += 1;")],
  ["due today count", app.includes("if (prospect.handoffDue && daysUntil(prospect.handoffDue) === 0) workload.due += 1;")],
  ["overdue label", app.includes("${escapeHtml(workload.overdue)} overdue")],
  ["due today label", app.includes("${escapeHtml(workload.due)} due today")],
  ["blocked label retained", app.includes("${escapeHtml(workload.blocked)} blocked")],
  ["accepted label retained", app.includes("${escapeHtml(workload.accepted)} accepted")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Owner workload due-state test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Owner workload due-state test passed.");
