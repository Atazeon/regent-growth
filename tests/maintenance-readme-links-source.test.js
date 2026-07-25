const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");

const checks = [
  ["README has maintenance section", readme.includes("## Maintenance")],
  ["README links runbook", readme.includes("[docs/RUNBOOK.md](docs/RUNBOOK.md)")],
  ["README links feedback checklist", readme.includes("[docs/USER_FEEDBACK.md](docs/USER_FEEDBACK.md)")],
  ["README warns about runtime data", readme.includes("Keep runtime data, shared backups, and secrets out of Git.")],
  ["README keeps data section", readme.includes("## Data And Secrets")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance README links test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance README links test passed.");
