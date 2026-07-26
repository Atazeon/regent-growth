const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["README mentions first session tracker", readme.includes("Tracks a first real outbound session with 25")],
  ["plan mentions saved tracker", plan.includes("saved 25-step first outbound session tracker")],
  ["plan advanced next milestone", plan.includes("- Improvement queue triage")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound session docs test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound session docs test passed.");
