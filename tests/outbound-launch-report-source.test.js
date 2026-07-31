const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["launch report copy button exists", html.includes('id="copyOutboundLaunchReportButton"')],
  ["launch report download button exists", html.includes('id="downloadOutboundLaunchReportButton"')],
  ["launch report copy selector exists", app.includes('const copyOutboundLaunchReportButton = document.querySelector("#copyOutboundLaunchReportButton")')],
  ["launch report download selector exists", app.includes('const downloadOutboundLaunchReportButton = document.querySelector("#downloadOutboundLaunchReportButton")')],
  ["launch report formatter exists", app.includes("function formatOutboundLaunchReport()")],
  ["launch report title exists", app.includes("First Real Outbound Launch Report")],
  ["launch report includes launch log", app.includes("const launchLog = formatOutboundLaunchLog()")],
  ["launch report includes post-launch review", app.includes("const postLaunchReview = formatOutboundPostLaunchReview()")],
  ["launch report includes outcomes", app.includes("const outcomes = formatOutboundOutcomeSummary()")],
  ["launch report includes open fixes", app.includes('["Open", "In Progress"].includes(item.status)')],
  ["launch report copy handler exists", app.includes("async function copyOutboundLaunchReport()")],
  ["launch report download handler exists", app.includes("function downloadOutboundLaunchReport()")],
  ["launch report filename exists", app.includes("regent-growth-first-run-launch-report-")],
  ["launch report copy bound", app.includes('copyOutboundLaunchReportButton.addEventListener("click", copyOutboundLaunchReport)')],
  ["launch report download bound", app.includes('downloadOutboundLaunchReportButton.addEventListener("click", downloadOutboundLaunchReport)')],
  ["README mentions launch report", readme.includes("launch report")],
  ["plan next follow-up batch", plan.includes("- Outbound operating QA pass")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound launch report test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound launch report test passed.");
