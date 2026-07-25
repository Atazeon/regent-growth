const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["reminder section exists", html.includes('id="reminders"')],
  ["reminder list exists", html.includes('id="reminderList"')],
  ["mark touched behavior exists", app.includes("function markReminderTouched")],
  ["snooze behavior exists", app.includes("function snoozeReminder")],
  ["open reminder behavior exists", app.includes("function openReminder")],
  ["sequence send behavior exists", app.includes("function markSequenceEmailSent")],
  ["LinkedIn move behavior exists", app.includes("function markSequenceLinkedInSent")],
  ["call move behavior exists", app.includes("function planSequenceCall")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product reminder controls test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product reminder controls test passed.");
