const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["README mentions fix queue", readme.includes("outcome-driven fix queue")],
  ["plan mentions queue statuses", plan.includes("filterable outcome-driven fix queue with open/in-progress/resolved/archived statuses")],
  ["plan next triage", plan.includes("- First real outbound run post-launch review")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements docs test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements docs test passed.");
