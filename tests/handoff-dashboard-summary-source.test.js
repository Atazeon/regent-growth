const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["total handoffs", app.includes("const totalHandoffs = workloads.reduce((sum, item) => sum + item.total, 0);")],
  ["overdue handoffs", app.includes("const overdueHandoffs = workloads.reduce((sum, item) => sum + item.overdue, 0);")],
  ["blocked handoffs", app.includes("const blockedHandoffs = workloads.reduce((sum, item) => sum + item.blocked, 0);")],
  ["accepted handoffs", app.includes("const acceptedHandoffs = workloads.reduce((sum, item) => sum + item.accepted, 0);")],
  ["empty summary", app.includes('totalHandoffs === 0\n    ? "No active handoffs"')],
  ["owner count pluralized", app.includes('owner${workloads.length === 1 ? "" : "s"}')],
  ["summary includes active", app.includes("${totalHandoffs} active")],
  ["summary includes overdue", app.includes("${overdueHandoffs} overdue")],
  ["summary includes blocked", app.includes("${blockedHandoffs} blocked")],
  ["summary includes accepted", app.includes("${acceptedHandoffs} accepted")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Handoff dashboard summary test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Handoff dashboard summary test passed.");
