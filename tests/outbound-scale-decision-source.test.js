const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["scale decision copy button exists", html.includes('id="copyScaleDecisionButton"')],
  ["scale decision download button exists", html.includes('id="downloadScaleDecisionButton"')],
  ["scale decision copy selector exists", app.includes('const copyScaleDecisionButton = document.querySelector("#copyScaleDecisionButton")')],
  ["scale decision download selector exists", app.includes('const downloadScaleDecisionButton = document.querySelector("#downloadScaleDecisionButton")')],
  ["scale decision helper exists", app.includes("function getOutboundScaleDecision()")],
  ["scale decision formatter exists", app.includes("function formatOutboundScaleDecision()")],
  ["scale decision title exists", app.includes("Outbound Scale Decision Packet")],
  ["scale decision hold exists", app.includes('"Hold"')],
  ["scale decision small batch exists", app.includes('"Run Small Batch"')],
  ["scale decision scale exists", app.includes('"Scale Carefully"')],
  ["scale decision copy handler exists", app.includes("async function copyOutboundScaleDecision()")],
  ["scale decision download handler exists", app.includes("function downloadOutboundScaleDecision()")],
  ["scale decision filename exists", app.includes("regent-growth-outbound-scale-decision-")],
  ["scale decision copy bound", app.includes('copyScaleDecisionButton.addEventListener("click", copyOutboundScaleDecision)')],
  ["scale decision download bound", app.includes('downloadScaleDecisionButton.addEventListener("click", downloadOutboundScaleDecision)')],
  ["README mentions scale decision", readme.includes("scale decision")],
  ["plan next operating dashboard", plan.includes("- Production integration provider setup")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound scale decision test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound scale decision test passed.");
