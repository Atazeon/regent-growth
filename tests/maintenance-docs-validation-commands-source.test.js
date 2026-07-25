const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const runbook = fs.readFileSync(path.join(root, "docs", "RUNBOOK.md"), "utf8");

const commands = [
  "--check app.js",
  "--check local-research-server.js",
  "tests\\run-source-tests.js",
  "git diff --check"
];

const checks = commands.flatMap((command) => [
  [`README includes ${command}`, readme.includes(command)],
  [`runbook includes ${command}`, runbook.includes(command)]
]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance docs validation commands test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance docs validation commands test passed.");
