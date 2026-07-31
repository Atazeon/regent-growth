const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["filtered outcomes copy button exists", html.includes('id="copyFilteredOutboundOutcomesButton"')],
  ["filtered outcomes download button exists", html.includes('id="downloadFilteredOutboundOutcomesButton"')],
  ["filtered outcomes copy selector exists", app.includes('const copyFilteredOutboundOutcomesButton = document.querySelector("#copyFilteredOutboundOutcomesButton")')],
  ["filtered outcomes download selector exists", app.includes('const downloadFilteredOutboundOutcomesButton = document.querySelector("#downloadFilteredOutboundOutcomesButton")')],
  ["visible outcomes helper exists", app.includes("function getVisibleOutboundOutcomes()")],
  ["filtered outcomes formatter exists", app.includes("function formatFilteredOutboundOutcomeSummary()")],
  ["filtered outcomes title exists", app.includes("Filtered Outbound Run Outcomes")],
  ["filtered outcomes copy handler exists", app.includes("async function copyFilteredOutboundOutcomeSummary()")],
  ["filtered outcomes download handler exists", app.includes("function downloadFilteredOutboundOutcomeSummary()")],
  ["filtered outcomes filename exists", app.includes("regent-growth-filtered-outbound-outcomes-")],
  ["filtered outcomes disabled state exists", app.includes("button.disabled = visibleOutcomes.length === 0")],
  ["filtered outcomes copy bound", app.includes('copyFilteredOutboundOutcomesButton.addEventListener("click", copyFilteredOutboundOutcomeSummary)')],
  ["filtered outcomes download bound", app.includes('downloadFilteredOutboundOutcomesButton.addEventListener("click", downloadFilteredOutboundOutcomeSummary)')],
  ["README mentions filtered exports", readme.includes("filtered exports")],
  ["plan next operating CSV exports", plan.includes("- Outbound launch hardening")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound launch hardening test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound launch hardening test passed.");
