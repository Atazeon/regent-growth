const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["launch hardening copy button exists", html.includes('id="copyLaunchHardeningButton"')],
  ["launch hardening download button exists", html.includes('id="downloadLaunchHardeningButton"')],
  ["launch hardening copy selector exists", app.includes('const copyLaunchHardeningButton = document.querySelector("#copyLaunchHardeningButton")')],
  ["launch hardening download selector exists", app.includes('const downloadLaunchHardeningButton = document.querySelector("#downloadLaunchHardeningButton")')],
  ["launch hardening formatter exists", app.includes("function formatOutboundLaunchHardening()")],
  ["launch hardening title exists", app.includes("Outbound Launch Hardening Checklist")],
  ["launch hardening gates exist", app.includes("Hard Gates")],
  ["launch hardening do not launch exists", app.includes("Do Not Launch If")],
  ["launch hardening copy handler exists", app.includes("async function copyOutboundLaunchHardening()")],
  ["launch hardening download handler exists", app.includes("function downloadOutboundLaunchHardening()")],
  ["launch hardening filename exists", app.includes("regent-growth-outbound-launch-hardening-")],
  ["launch hardening copy bound", app.includes('copyLaunchHardeningButton.addEventListener("click", copyOutboundLaunchHardening)')],
  ["launch hardening download bound", app.includes('downloadLaunchHardeningButton.addEventListener("click", downloadOutboundLaunchHardening)')],
  ["README mentions launch hardening", readme.includes("launch hardening")],
  ["plan next final runbook", plan.includes("- Production integration provider setup")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Production integration provider setup test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production integration provider setup test passed.");
