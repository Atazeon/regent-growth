const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["README mentions outcomes", readme.includes("live run outcomes")],
  ["plan mentions outcome counts", plan.includes("outcome counts")],
  ["plan mentions outcome actions", plan.includes("outcome copy/download/clear actions")],
  ["plan moves to fixes", plan.includes("- First run snapshot count summary")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound outcomes docs test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound outcomes docs test passed.");
