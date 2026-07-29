const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["README mentions area filters", readme.includes("area filters") && readme.includes("next-step controls")],
  ["plan mentions area filters", plan.includes("area filters, next-step focus, visible-step completion")],
  ["plan moved to outcomes", plan.includes("- First run packet download")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound session refinement docs test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound session refinement docs test passed.");
