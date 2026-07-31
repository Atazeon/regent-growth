const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["second batch packet copy button exists", html.includes('id="copySecondBatchExecutionPacketButton"')],
  ["second batch packet download button exists", html.includes('id="downloadSecondBatchExecutionPacketButton"')],
  ["second batch packet copy selector exists", app.includes('const copySecondBatchExecutionPacketButton = document.querySelector("#copySecondBatchExecutionPacketButton")')],
  ["second batch packet download selector exists", app.includes('const downloadSecondBatchExecutionPacketButton = document.querySelector("#downloadSecondBatchExecutionPacketButton")')],
  ["second batch packet formatter exists", app.includes("function formatSecondBatchExecutionPacket()")],
  ["second batch packet title exists", app.includes("Second Real Outbound Batch Execution Packet")],
  ["second batch packet uses readiness", app.includes("const summary = getSecondBatchReadinessSummary()")],
  ["second batch packet preflight exists", app.includes("Preflight")],
  ["second batch packet stop rules exist", app.includes("Stop Rules")],
  ["second batch packet copy handler exists", app.includes("async function copySecondBatchExecutionPacket()")],
  ["second batch packet download handler exists", app.includes("function downloadSecondBatchExecutionPacket()")],
  ["second batch packet filename exists", app.includes("regent-growth-second-batch-execution-packet-")],
  ["second batch packet copy bound", app.includes('copySecondBatchExecutionPacketButton.addEventListener("click", copySecondBatchExecutionPacket)')],
  ["second batch packet download bound", app.includes('downloadSecondBatchExecutionPacketButton.addEventListener("click", downloadSecondBatchExecutionPacket)')],
  ["README mentions second-batch packet", readme.includes("second-batch execution packet")],
  ["plan next second batch outcome tracking", plan.includes("- Outbound operating dashboard")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound second batch execution packet test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound second batch execution packet test passed.");
