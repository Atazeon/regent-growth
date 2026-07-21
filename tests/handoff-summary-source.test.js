const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["handoff summary helper", app.includes("function renderSelectedHandoffSummary(prospect)")],
  ["owner name reused", app.includes("const owner = getOwnerName(prospect);")],
  ["status fallback", app.includes('const status = prospect.handoffStatus || "Unassigned";')],
  ["due date text", app.includes('const dueText = prospect.handoffDue ? ` | ${getReminderLabel(daysUntil(prospect.handoffDue))} (${formatDate(prospect.handoffDue)})` : " | No due date";')],
  ["blocked text", app.includes('const blockedText = isBlockedHandoff(prospect) ? " | Blocked" : "";')],
  ["summary output", app.includes("return `${owner} | ${status}${dueText}${blockedText}`;")],
  ["detail card", app.includes("<span>Handoff Summary</span>")],
  ["detail render", app.includes("escapeHtml(renderSelectedHandoffSummary(prospect))")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Handoff summary test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Handoff summary test passed.");
