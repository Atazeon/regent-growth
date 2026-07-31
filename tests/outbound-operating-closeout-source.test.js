const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["operating closeout copy button exists", html.includes('id="copyOperatingCloseoutButton"')],
  ["operating closeout download button exists", html.includes('id="downloadOperatingCloseoutButton"')],
  ["operating closeout copy selector exists", app.includes('const copyOperatingCloseoutButton = document.querySelector("#copyOperatingCloseoutButton")')],
  ["operating closeout download selector exists", app.includes('const downloadOperatingCloseoutButton = document.querySelector("#downloadOperatingCloseoutButton")')],
  ["operating closeout formatter exists", app.includes("function formatOutboundOperatingCloseout()")],
  ["operating closeout title exists", app.includes("Outbound Operating Closeout")],
  ["operating closeout includes QA", app.includes("formatOutboundOperatingQa()")],
  ["operating closeout includes scale decision", app.includes("formatOutboundScaleDecision()")],
  ["operating closeout includes comparison", app.includes("formatBatchComparison()")],
  ["operating closeout includes second report", app.includes("formatSecondBatchReport()")],
  ["operating closeout copy handler exists", app.includes("async function copyOutboundOperatingCloseout()")],
  ["operating closeout download handler exists", app.includes("function downloadOutboundOperatingCloseout()")],
  ["operating closeout filename exists", app.includes("regent-growth-outbound-operating-closeout-")],
  ["operating closeout copy bound", app.includes('copyOperatingCloseoutButton.addEventListener("click", copyOutboundOperatingCloseout)')],
  ["operating closeout download bound", app.includes('downloadOperatingCloseoutButton.addEventListener("click", downloadOutboundOperatingCloseout)')],
  ["README mentions operating closeout", readme.includes("operating closeout")],
  ["plan next launch hardening", plan.includes("- Production email and calendar integrations")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Production email and calendar integrations test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production email and calendar integrations test passed.");
