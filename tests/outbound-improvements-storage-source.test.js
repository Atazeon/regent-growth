const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["fallback includes improvements", app.includes("improvements: {},\n    archiveCloseoutExportedAt: \"\",\n    completed: {}")],
  ["loads improvements", app.includes("parsedState.improvements")],
  ["resets improvements", app.includes("improvements: {},\n    archiveCloseoutExportedAt: \"\",\n    completed: {}")],
  ["persists status", app.includes("status: status === \"Archived\" ? \"Resolved\" : status")],
  ["persists archive date", app.includes("archivedAt: status === \"Archived\"")],
  ["uses blocker outcomes", app.includes('["Blocked", "Fix Needed"].includes(outcome.type)')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements storage test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements storage test passed.");
