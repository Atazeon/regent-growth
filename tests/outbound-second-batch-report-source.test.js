const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["second batch report copy button exists", html.includes('id="copySecondBatchReportButton"')],
  ["second batch report download button exists", html.includes('id="downloadSecondBatchReportButton"')],
  ["second batch report copy selector exists", app.includes('const copySecondBatchReportButton = document.querySelector("#copySecondBatchReportButton")')],
  ["second batch report download selector exists", app.includes('const downloadSecondBatchReportButton = document.querySelector("#downloadSecondBatchReportButton")')],
  ["second batch outcomes helper exists", app.includes("function getSecondBatchOutcomes()")],
  ["second batch outcome counts helper exists", app.includes("function getSecondBatchOutcomeCounts()")],
  ["second batch report formatter exists", app.includes("function formatSecondBatchReport()")],
  ["second batch report title exists", app.includes("Second Real Outbound Batch Report")],
  ["second batch report filters outcomes", app.includes('(outcome.batch || "First Run") === "Second Batch"')],
  ["second batch report copy handler exists", app.includes("async function copySecondBatchReport()")],
  ["second batch report download handler exists", app.includes("function downloadSecondBatchReport()")],
  ["second batch report filename exists", app.includes("regent-growth-second-batch-report-")],
  ["second batch report copy bound", app.includes('copySecondBatchReportButton.addEventListener("click", copySecondBatchReport)')],
  ["second batch report download bound", app.includes('downloadSecondBatchReportButton.addEventListener("click", downloadSecondBatchReport)')],
  ["README mentions second-batch report", readme.includes("second-batch report")],
  ["plan next comparison", plan.includes("- Outbound scale decision packet")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound second batch report test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound second batch report test passed.");
