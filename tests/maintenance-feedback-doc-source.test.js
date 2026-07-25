const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const feedback = fs.readFileSync(path.join(root, "docs", "USER_FEEDBACK.md"), "utf8");

const checks = [
  ["feedback title exists", feedback.includes("# User Feedback Checklist")],
  ["feedback covers Daily AI", feedback.includes("## Daily AI")],
  ["feedback covers pipeline", feedback.includes("## Pipeline Work")],
  ["feedback covers CRM", feedback.includes("## Handoff And CRM")],
  ["feedback covers team sync", feedback.includes("## Team Sync")],
  ["feedback includes friction log", feedback.includes("## Friction Log")],
  ["feedback asks blocker status", feedback.includes("Whether it blocks real use")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance feedback doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance feedback doc test passed.");
