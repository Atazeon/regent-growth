const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const files = ["README.md", path.join("docs", "RUNBOOK.md"), path.join("docs", "USER_FEEDBACK.md")];

const checks = files.map((file) => {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  return [`${file} uses ASCII`, /^[\x00-\x7F]*$/.test(content)];
});

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance docs ASCII test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance docs ASCII test passed.");
