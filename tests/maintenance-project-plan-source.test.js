const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["plan keeps product goal", plan.includes("## Product Goal")],
  ["plan keeps MVP scope", plan.includes("## MVP Scope")],
  ["plan keeps current status", plan.includes("Current status:")],
  ["plan keeps Ollama direction", plan.includes("AI direction: use local Ollama")],
  ["plan tracks maintenance next", plan.includes("- Product maintenance and real-user feedback pass") || plan.includes("- Post-launch usability improvements") || plan.includes("- First real outbound session feedback") || plan.includes("- Second outbound session refinements")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance project plan test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance project plan test passed.");
