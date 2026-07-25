const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["summary formatter exists", app.includes("function formatOutboundOutcomeSummary()")],
  ["session summary includes outcomes", app.includes('"Outcomes"') && app.includes("...(outcomeLines.length ? outcomeLines : [\"No outcomes logged yet.\"])")],
  ["download filename exists", app.includes("regent-growth-outbound-outcomes-")],
  ["limits outcome history", app.includes("].slice(0, 100)")],
  ["requires note", app.includes('setDataStatus("Add an outcome note before logging.", "error")')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound outcomes summary test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound outcomes summary test passed.");
