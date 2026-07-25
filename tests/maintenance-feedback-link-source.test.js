const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const feedback = fs.readFileSync(path.join(root, "docs", "USER_FEEDBACK.md"), "utf8");
const runbook = fs.readFileSync(path.join(root, "docs", "RUNBOOK.md"), "utf8");

const checks = [
  ["README points to feedback", readme.includes("USER_FEEDBACK.md")],
  ["feedback asks what expected", feedback.includes("What you expected")],
  ["feedback asks what happened", feedback.includes("What happened")],
  ["feedback asks severity", feedback.includes("How severe it was")],
  ["runbook references troubleshooting", runbook.includes("Troubleshooting")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance feedback link test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance feedback link test passed.");
