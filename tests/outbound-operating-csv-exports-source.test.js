const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["filtered CSV button exists", html.includes('id="downloadFilteredOutboundOutcomesCsvButton"')],
  ["filtered CSV selector exists", app.includes('const downloadFilteredOutboundOutcomesCsvButton = document.querySelector("#downloadFilteredOutboundOutcomesCsvButton")')],
  ["filtered CSV disabled exists", app.includes("downloadFilteredOutboundOutcomesCsvButton") && app.includes("button.disabled = visibleOutcomes.length === 0")],
  ["filtered CSV handler exists", app.includes("function downloadFilteredOutboundOutcomeCsv()")],
  ["filtered CSV headers exist", app.includes('const headers = ["batch", "type", "company", "note", "createdAt"]')],
  ["filtered CSV rows include batch", app.includes('outcome.batch || "First Run"')],
  ["filtered CSV filename exists", app.includes("regent-growth-filtered-outbound-outcomes-${stamp}.csv")],
  ["filtered CSV uses csv helper", app.includes("row.map(csvCell).join(\",\")")],
  ["filtered CSV bound", app.includes('downloadFilteredOutboundOutcomesCsvButton.addEventListener("click", downloadFilteredOutboundOutcomeCsv)')],
  ["README mentions CSV exports", readme.includes("CSV exports")],
  ["plan next operating QA", plan.includes("- Outbound operating QA pass")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound operating QA pass test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound operating QA pass test passed.");
