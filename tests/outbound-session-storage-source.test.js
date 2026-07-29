const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["storage key exists", app.includes('const outboundSessionStorageKey = "regent-growth-outbound-session"')],
  ["loads saved state", app.includes("function loadOutboundSessionState()") && app.includes("localStorage.getItem(outboundSessionStorageKey)")],
  ["saves state", app.includes("function saveOutboundSessionState()") && app.includes("localStorage.setItem(outboundSessionStorageKey")],
  ["tracks completion timestamp", app.includes("outboundSessionState.completedAt = completedCount === outboundSessionItems.length")],
  ["resets storage", app.includes("localStorage.removeItem(outboundSessionStorageKey)")],
  ["notes persist", app.includes("outboundSessionState.notes = outboundSessionNotes.value.trim()")],
  ["snapshots persist", app.includes("runSnapshots: Array.isArray(parsedState.runSnapshots)")],
  ["snapshots reset", app.includes("runSnapshots: [],\n    completed: {}")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound session storage test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound session storage test passed.");
