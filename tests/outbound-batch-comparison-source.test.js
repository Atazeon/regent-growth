const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["batch comparison copy button exists", html.includes('id="copyBatchComparisonButton"')],
  ["batch comparison download button exists", html.includes('id="downloadBatchComparisonButton"')],
  ["batch comparison copy selector exists", app.includes('const copyBatchComparisonButton = document.querySelector("#copyBatchComparisonButton")')],
  ["batch comparison download selector exists", app.includes('const downloadBatchComparisonButton = document.querySelector("#downloadBatchComparisonButton")')],
  ["batch comparison count helper exists", app.includes("function getOutcomeCountsForBatch(batch)")],
  ["batch comparison formatter exists", app.includes("function formatBatchComparison()")],
  ["batch comparison title exists", app.includes("First vs Second Outbound Batch Comparison")],
  ["batch comparison delta exists", app.includes("delta ${formatSignedDelta(second - first)}")],
  ["batch comparison copy handler exists", app.includes("async function copyBatchComparison()")],
  ["batch comparison download handler exists", app.includes("function downloadBatchComparison()")],
  ["batch comparison filename exists", app.includes("regent-growth-batch-comparison-")],
  ["batch comparison copy bound", app.includes('copyBatchComparisonButton.addEventListener("click", copyBatchComparison)')],
  ["batch comparison download bound", app.includes('downloadBatchComparisonButton.addEventListener("click", downloadBatchComparison)')],
  ["README mentions batch comparison", readme.includes("batch comparison")],
  ["plan next scale decision", plan.includes("- Outbound operating closeout")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound batch comparison test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound batch comparison test passed.");
