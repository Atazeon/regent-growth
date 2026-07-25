const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["renders session", app.includes("function renderOutboundSession()")],
  ["formats summary", app.includes("function formatOutboundSessionSummary()")],
  ["copies summary", app.includes("function copyOutboundSessionSummary()") && app.includes("copyTextWithFallback(formatOutboundSessionSummary())")],
  ["downloads summary", app.includes("function downloadOutboundSessionSummary()") && app.includes("regent-growth-outbound-session-")],
  ["updates step", app.includes("function updateOutboundSessionStep(stepId, completed)")],
  ["binds checklist changes", app.includes('input[data-outbound-session-id]')],
  ["binds notes submit", app.includes('outboundSessionNotesForm.addEventListener("submit", saveOutboundSessionNotes)')],
  ["binds reset", app.includes('resetOutboundSessionButton.addEventListener("click", resetOutboundSessionState)')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound session actions test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound session actions test passed.");
