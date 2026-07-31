const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["second batch copy button exists", html.includes('id="copySecondBatchReadinessButton"')],
  ["second batch download button exists", html.includes('id="downloadSecondBatchReadinessButton"')],
  ["second batch copy selector exists", app.includes('const copySecondBatchReadinessButton = document.querySelector("#copySecondBatchReadinessButton")')],
  ["second batch download selector exists", app.includes('const downloadSecondBatchReadinessButton = document.querySelector("#downloadSecondBatchReadinessButton")')],
  ["second batch summary helper exists", app.includes("function getSecondBatchReadinessSummary()")],
  ["second batch formatter exists", app.includes("function formatSecondBatchReadiness()")],
  ["second batch title exists", app.includes("Second Real Outbound Batch Readiness")],
  ["second batch hold state exists", app.includes('"Hold"')],
  ["second batch small state exists", app.includes('"Small Batch"')],
  ["second batch ready state exists", app.includes('"Ready"')],
  ["second batch uses post-launch review", app.includes("const reviewSaved = hasOutboundPostLaunchReview()")],
  ["second batch uses launch log", app.includes("const launchLogged = (outboundSessionState.launchLog || []).length > 0")],
  ["second batch copy handler exists", app.includes("async function copySecondBatchReadiness()")],
  ["second batch download handler exists", app.includes("function downloadSecondBatchReadiness()")],
  ["second batch filename exists", app.includes("regent-growth-second-batch-readiness-")],
  ["second batch copy bound", app.includes('copySecondBatchReadinessButton.addEventListener("click", copySecondBatchReadiness)')],
  ["second batch download bound", app.includes('downloadSecondBatchReadinessButton.addEventListener("click", downloadSecondBatchReadiness)')],
  ["README mentions second-batch readiness", readme.includes("second-batch readiness")],
  ["plan next second execution packet", plan.includes("- Outbound operating QA pass")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound second batch readiness test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound second batch readiness test passed.");
