const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "POST_LAUNCH_USABILITY.md"), "utf8");

const checks = [
  ["post-launch doc title exists", doc.includes("# Post-Launch Usability Pass")],
  ["doc includes session setup", doc.includes("## Session Setup")],
  ["doc includes walkthrough", doc.includes("## Walkthrough")],
  ["doc includes scoring", doc.includes("## Score Each Area")],
  ["doc includes ship criteria", doc.includes("## Ship Criteria")],
  ["doc references local server", doc.includes("local-research-server.js")],
  ["doc references qwen3", doc.includes("qwen3:8b")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Post-launch usability doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Post-launch usability doc test passed.");
