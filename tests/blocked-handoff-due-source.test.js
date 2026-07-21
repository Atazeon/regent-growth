const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["blocked due helper", app.includes("function renderBlockedHandoffDueText(prospect)")],
  ["due state wording", app.includes("`${getReminderLabel(daysUntil(prospect.handoffDue))} (${formatDate(prospect.handoffDue)})`")],
  ["missing due fallback", app.includes(': "No due date";')],
  ["blocked row uses helper", app.includes("${escapeHtml(getOwnerName(prospect))} | ${escapeHtml(renderBlockedHandoffDueText(prospect))}")],
  ["old fixed due removed", !app.includes(" | Due ${escapeHtml(formatDate(prospect.handoffDue))}")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Blocked handoff due-state test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Blocked handoff due-state test passed.");
