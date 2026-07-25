const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "POST_LAUNCH_USABILITY.md"), "utf8");

const expected = [
  "Generate discovery candidates.",
  "Review source evidence and reject weak candidates.",
  "Run Daily AI for a small batch.",
  "Review drafted emails.",
  "Mark the email sent and verify the next touch date.",
  "Move a warm lead into CRM-ready handoff.",
  "Assign an owner, due date, status, and handoff note.",
  "Run CRM setup check",
  "Export a CRM summary or handoff packet."
];

const checks = expected.map((item) => [`walkthrough includes ${item}`, doc.includes(item)]);
const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Post-launch walkthrough coverage test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Post-launch walkthrough coverage test passed.");
