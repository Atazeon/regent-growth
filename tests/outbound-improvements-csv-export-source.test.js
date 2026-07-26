const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["csv button exists", html.includes('id="downloadFilteredOutboundImprovementsCsvButton"')],
  ["csv function exists", app.includes("function downloadFilteredOutboundImprovementCsv()")],
  ["csv uses visible items", app.includes("const items = getVisibleOutboundImprovementItems()")],
  ["csv filename exists", app.includes("regent-growth-filtered-fixes-")],
  ["csv uses csvCell", app.includes("].map(csvCell).join(\",\")")],
  ["csv button bound", app.includes('downloadFilteredOutboundImprovementsCsvButton.addEventListener("click", downloadFilteredOutboundImprovementCsv)')],
  ["README mentions CSV export", readme.includes("CSV export")],
  ["plan next final polish", plan.includes("- Fix queue final polish pass")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound improvements CSV export test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound improvements CSV export test passed.");
