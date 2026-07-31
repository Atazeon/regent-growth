const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["operating QA copy button exists", html.includes('id="copyOperatingQaButton"')],
  ["operating QA download button exists", html.includes('id="downloadOperatingQaButton"')],
  ["operating QA copy selector exists", app.includes('const copyOperatingQaButton = document.querySelector("#copyOperatingQaButton")')],
  ["operating QA download selector exists", app.includes('const downloadOperatingQaButton = document.querySelector("#downloadOperatingQaButton")')],
  ["operating QA items helper exists", app.includes("function getOutboundOperatingQaItems()")],
  ["operating QA formatter exists", app.includes("function formatOutboundOperatingQa()")],
  ["operating QA title exists", app.includes("Outbound Operating QA Checklist")],
  ["operating QA launch log check exists", app.includes("Launch log has entries")],
  ["operating QA second batch check exists", app.includes("Second-batch outcomes tracked")],
  ["operating QA copy handler exists", app.includes("async function copyOutboundOperatingQa()")],
  ["operating QA download handler exists", app.includes("function downloadOutboundOperatingQa()")],
  ["operating QA filename exists", app.includes("regent-growth-outbound-operating-qa-")],
  ["operating QA copy bound", app.includes('copyOperatingQaButton.addEventListener("click", copyOutboundOperatingQa)')],
  ["operating QA download bound", app.includes('downloadOperatingQaButton.addEventListener("click", downloadOutboundOperatingQa)')],
  ["README mentions QA pass", readme.includes("QA pass")],
  ["plan next closeout", plan.includes("- Outbound launch hardening")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound operating QA test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound operating QA test passed.");
