const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

const checks = [
  ["reminder item helper", app.includes("function renderReminderItem({ prospect, index, days })")],
  ["reminder group helper", app.includes("function renderReminderGroup(title, items)")],
  ["overdue group", app.includes('renderReminderGroup("Overdue", reminders.filter(({ days }) => days < 0))')],
  ["due today group", app.includes('renderReminderGroup("Due today", reminders.filter(({ days }) => days === 0))')],
  ["upcoming group", app.includes('renderReminderGroup("Upcoming", reminders.filter(({ days }) => days > 0))')],
  ["group task pluralization", app.includes('items.length} task${items.length === 1 ? "" : "s"}')],
  ["open reminder action", app.includes('data-action="open-reminder-prospect"')],
  ["group heading styles", styles.includes(".reminder-group-heading")],
  ["mobile group heading rule", styles.includes(".reminder-group-heading,\n  .reminder-item")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Reminder queue source test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Reminder queue source test passed.");
