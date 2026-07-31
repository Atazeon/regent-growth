const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["launch log form exists", html.includes('id="outboundLaunchLogForm"')],
  ["launch log status exists", html.includes('id="outboundLaunchLogStatus"')],
  ["launch log company exists", html.includes('id="outboundLaunchLogCompany"')],
  ["launch log note exists", html.includes('id="outboundLaunchLogNote"')],
  ["launch log summary exists", html.includes('id="outboundLaunchLogSummary"')],
  ["launch log list exists", html.includes('id="outboundLaunchLogList"')],
  ["launch log copy button exists", html.includes('id="copyOutboundLaunchLogButton"')],
  ["launch log download button exists", html.includes('id="downloadOutboundLaunchLogButton"')],
  ["launch log clear button exists", html.includes('id="clearOutboundLaunchLogButton"')],
  ["launch log selector exists", app.includes('const outboundLaunchLogForm = document.querySelector("#outboundLaunchLogForm")')],
  ["launch log storage exists", app.includes("launchLog: []")],
  ["launch log load normalization exists", app.includes("parsedState.launchLog")],
  ["launch log normalizer exists", app.includes("function normalizeOutboundLaunchLog(entry)")],
  ["launch log render exists", app.includes("function renderOutboundLaunchLog()")],
  ["launch log render is called", app.includes("renderOutboundLaunchLog();")],
  ["launch log record export exists", app.includes("launchLog: outboundSessionState.launchLog || []")],
  ["launch log snapshot import exists", app.includes("snapshot.launchLog.map(normalizeOutboundLaunchLog)")],
  ["launch log snapshot restore exists", app.includes("snapshot.session.launchLog.map(normalizeOutboundLaunchLog)")],
  ["launch log add handler exists", app.includes("function addOutboundLaunchLog(event)")],
  ["launch log delete handler exists", app.includes("function deleteOutboundLaunchLog(id)")],
  ["launch log formatter exists", app.includes("function formatOutboundLaunchLog()")],
  ["launch log copy handler exists", app.includes("async function copyOutboundLaunchLog()")],
  ["launch log download handler exists", app.includes("function downloadOutboundLaunchLog()")],
  ["launch log clear handler exists", app.includes("function clearOutboundLaunchLog()")],
  ["launch log filename exists", app.includes("regent-growth-first-run-launch-log-")],
  ["launch log form bound", app.includes('outboundLaunchLogForm.addEventListener("submit", addOutboundLaunchLog)')],
  ["launch log list bound", app.includes('data-action="delete-outbound-launch-log"')],
  ["launch log copy bound", app.includes('copyOutboundLaunchLogButton.addEventListener("click", copyOutboundLaunchLog)')],
  ["launch log download bound", app.includes('downloadOutboundLaunchLogButton.addEventListener("click", downloadOutboundLaunchLog)')],
  ["launch log clear bound", app.includes('clearOutboundLaunchLogButton.addEventListener("click", clearOutboundLaunchLog)')],
  ["README mentions manual launch log", readme.includes("manual launch log")],
  ["plan next post-launch review", plan.includes("- First real outbound run follow-up batch plan")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound launch log test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound launch log test passed.");
