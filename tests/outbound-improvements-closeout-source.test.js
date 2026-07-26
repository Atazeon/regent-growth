const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["closeout button exists", html.includes('id="copyResolvedOutboundImprovementsButton"')],
  ["closeout download button exists", html.includes('id="downloadResolvedOutboundImprovementsButton"')],
  ["filtered closeout button exists", html.includes('id="copyFilteredCloseoutOutboundImprovementsButton"')],
  ["closeout formatter exists", app.includes("function formatResolvedOutboundImprovementCloseout()")],
  ["filtered closeout formatter exists", app.includes("function formatFilteredOutboundImprovementCloseout()")],
  ["closeout includes resolved and archived", app.includes('["Resolved", "Archived"].includes(item.status)')],
  ["closeout includes owners", app.includes("Owners: ${Object.entries(ownerCounts)")],
  ["closeout includes execution note", app.includes('`Closeout: ${item.executionNote || "No closeout note yet."}`')],
  ["closeout copy function exists", app.includes("async function copyResolvedOutboundImprovementCloseout()")],
  ["filtered closeout copy function exists", app.includes("async function copyFilteredOutboundImprovementCloseout()")],
  ["closeout download function exists", app.includes("function downloadResolvedOutboundImprovementCloseout()")],
  ["closeout download filename exists", app.includes("regent-growth-resolved-fix-closeout-")],
  ["closeout button disabled when empty", app.includes("copyResolvedOutboundImprovementsButton.disabled = resolvedItems.length + archivedItems.length === 0")],
  ["closeout download disabled when empty", app.includes("downloadResolvedOutboundImprovementsButton.disabled = resolvedItems.length + archivedItems.length === 0")],
  ["filtered closeout disabled when empty", app.includes("copyFilteredCloseoutOutboundImprovementsButton.disabled = visibleCloseoutItems.length === 0")],
  ["closeout button bound", app.includes('copyResolvedOutboundImprovementsButton.addEventListener("click", copyResolvedOutboundImprovementCloseout)')],
  ["closeout download bound", app.includes('downloadResolvedOutboundImprovementsButton.addEventListener("click", downloadResolvedOutboundImprovementCloseout)')],
  ["filtered closeout bound", app.includes('copyFilteredCloseoutOutboundImprovementsButton.addEventListener("click", copyFilteredOutboundImprovementCloseout)')],
  ["README mentions filtered closeout", readme.includes("filtered closeout copy")],
  ["plan next filtered closeout download", plan.includes("- Fix queue filtered closeout download")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements closeout test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements closeout test passed.");
