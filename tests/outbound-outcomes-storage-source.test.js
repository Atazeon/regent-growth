const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["types exist", app.includes('const outboundOutcomeTypes = ["Prospect Added", "Email Sent", "Reply Received", "Meeting Booked", "Blocked", "Fix Needed"]')],
  ["normalizer exists", app.includes("function normalizeOutboundOutcome(outcome)")],
  ["fallback includes outcomes", app.includes("outcomes: [],\n    completed: {}")],
  ["loads outcomes", app.includes("parsedState.outcomes") && app.includes("map(normalizeOutboundOutcome)")],
  ["summary record includes outcomes", app.includes("outcomes: outboundSessionState.outcomes")],
  ["summary record includes counts", app.includes("outcomeCounts: getOutboundOutcomeCounts()")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound outcomes storage test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound outcomes storage test passed.");
