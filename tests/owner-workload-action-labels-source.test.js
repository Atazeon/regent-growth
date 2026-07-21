const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["owner row button", app.includes('class="owner-row"')],
  ["owner action title", app.includes('title="Show handoffs assigned to ${escapeHtml(workload.owner)}"')],
  ["owner action aria", app.includes('aria-label="Show handoffs assigned to ${escapeHtml(workload.owner)}"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Owner workload action labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Owner workload action labels test passed.");
