const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["dry-run history list exists", html.includes('id="productionDryRunHistoryList"')],
  ["download dry-run history button exists", html.includes('id="downloadProductionDryRunHistoryButton"')],
  ["clear dry-run history button exists", html.includes('id="clearProductionDryRunHistoryButton"')],
  ["dry-run history storage key exists", app.includes('const productionDryRunHistoryStorageKey = "regent-growth-production-dry-run-history";')],
  ["dry-run history state loads", app.includes("let productionDryRunHistory = loadProductionDryRunHistory();")],
  ["dry-run history normalizer exists", app.includes("function normalizeProductionDryRunHistoryEntry(")],
  ["dry-run history loader exists", app.includes("function loadProductionDryRunHistory()")],
  ["dry-run history saver exists", app.includes("function saveProductionDryRunHistory()")],
  ["dry-run history renderer exists", app.includes("function renderProductionDryRunHistory()")],
  ["dry-run result recorder exists", app.includes("function recordProductionDryRunResult(")],
  ["dry-run records response", app.includes("recordProductionDryRunResult(result);")],
  ["dry-run export record exists", app.includes("function getProductionDryRunHistoryRecord()")],
  ["dry-run download exists", app.includes("function downloadProductionDryRunHistory()")],
  ["dry-run clear exists", app.includes("function clearProductionDryRunHistory()")],
  ["dry-run history filename exists", app.includes("regent-growth-production-dry-run-history-")],
  ["download dry-run listener exists", app.includes('downloadProductionDryRunHistoryButton.addEventListener("click", downloadProductionDryRunHistory)')],
  ["clear dry-run listener exists", app.includes('clearProductionDryRunHistoryButton.addEventListener("click", clearProductionDryRunHistory)')],
  ["dry-run history renders startup", app.includes("renderProductionDryRunHistory();")],
  ["plan next dry-run history exists", plan.includes("- Production send dry-run result history")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production dry-run history test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production dry-run history test passed.");
