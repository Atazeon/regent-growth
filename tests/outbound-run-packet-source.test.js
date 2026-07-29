const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["run packet button exists", html.includes('id="copyOutboundRunPacketButton"')],
  ["run packet download button exists", html.includes('id="downloadOutboundRunPacketButton"')],
  ["run readiness region exists", html.includes('id="outboundRunReadiness"')],
  ["run readiness selector exists", app.includes('const outboundRunReadiness = document.querySelector("#outboundRunReadiness")')],
  ["run packet button selector exists", app.includes('const copyOutboundRunPacketButton = document.querySelector("#copyOutboundRunPacketButton")')],
  ["run packet download selector exists", app.includes('const downloadOutboundRunPacketButton = document.querySelector("#downloadOutboundRunPacketButton")')],
  ["run readiness summary exists", app.includes("function getOutboundRunReadinessSummary()")],
  ["run packet formatter exists", app.includes("function formatOutboundRunPacket()")],
  ["run packet title exists", app.includes("First Real Outbound Run Packet")],
  ["run packet includes archive closeout", app.includes("Archive closeout: ${readiness.archiveCloseoutExported ? \"Exported\" : \"Not exported\"}")],
  ["run packet copy handler exists", app.includes("async function copyOutboundRunPacket()")],
  ["run packet download handler exists", app.includes("function downloadOutboundRunPacket()")],
  ["run packet download filename exists", app.includes("regent-growth-first-run-packet-")],
  ["run packet button bound", app.includes('copyOutboundRunPacketButton.addEventListener("click", copyOutboundRunPacket)')],
  ["run packet download bound", app.includes('downloadOutboundRunPacketButton.addEventListener("click", downloadOutboundRunPacket)')],
  ["run readiness CSS exists", css.includes(".outbound-run-readiness")],
  ["README mentions run packet download", readme.includes("live run packet copy/download")],
  ["plan next packet JSON export", plan.includes("- First run packet JSON export")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound run packet test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound run packet test passed.");
