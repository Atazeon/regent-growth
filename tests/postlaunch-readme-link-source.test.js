const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");

const checks = [
  ["README links post-launch usability doc", readme.includes("[docs/POST_LAUNCH_USABILITY.md](docs/POST_LAUNCH_USABILITY.md)")],
  ["README maintenance section exists", readme.includes("## Maintenance")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Post-launch README link test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Post-launch README link test passed.");
