const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["plan has final later item", plan.includes("- Fix queue final polish pass")],
  ["plan documents MVP status", plan.includes("Current status: the local prototype now supports")],
  ["plan documents Ollama direction", plan.includes("AI direction: use local Ollama")],
  ["plan documents qwen3", plan.includes("qwen3:8b")],
  ["plan documents GitHub habit", plan.includes("## GitHub Progress Habit")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product plan final line test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product plan final line test passed.");
