const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const required = [
  "index.html",
  "styles.css",
  "app.js",
  "local-research-server.js",
  "README.md",
  "PROJECT_PLAN.md",
  path.join("docs", "RUNBOOK.md"),
  path.join("docs", "USER_FEEDBACK.md"),
  path.join("data", "sample-prospects.json"),
  path.join("data", "prospect-import-template.csv"),
  path.join("tests", "run-source-tests.js")
];

const checks = required.map((file) => [`${file} exists`, fs.existsSync(path.join(root, file))]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance repo shape test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance repo shape test passed.");
