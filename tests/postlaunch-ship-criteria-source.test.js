const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "POST_LAUNCH_USABILITY.md"), "utf8");

const criteria = [
  "A new user can start the local server from docs without help.",
  "A new user can generate and review candidates without losing context.",
  "A new user can send or hand off one email draft.",
  "A new user can understand why CRM sync is disabled or ready.",
  "A new user can export data before risky restore or CRM work."
];

const checks = criteria.map((item) => [`ship criterion: ${item}`, doc.includes(item)]);
const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Post-launch ship criteria test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Post-launch ship criteria test passed.");
