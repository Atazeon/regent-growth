const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["closeout button exists", html.includes('id="copyResolvedOutboundImprovementsButton"')],
  ["closeout formatter exists", app.includes("function formatResolvedOutboundImprovementCloseout()")],
  ["closeout only resolved", app.includes('filter((item) => item.status === "Resolved")')],
  ["closeout includes owners", app.includes("Owners: ${Object.entries(ownerCounts)")],
  ["closeout includes execution note", app.includes('`Closeout: ${item.executionNote || "No closeout note yet."}`')],
  ["closeout copy function exists", app.includes("async function copyResolvedOutboundImprovementCloseout()")],
  ["closeout button disabled when empty", app.includes("copyResolvedOutboundImprovementsButton.disabled = resolvedItems.length === 0")],
  ["closeout button bound", app.includes('copyResolvedOutboundImprovementsButton.addEventListener("click", copyResolvedOutboundImprovementCloseout)')],
  ["README mentions closeout copy", readme.includes("closeout copy")],
  ["plan next closeout download", plan.includes("- Fix queue closeout download")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements closeout test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements closeout test passed.");
