const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["operating dashboard region exists", html.includes('id="outboundOperatingDashboard"')],
  ["operating dashboard aria exists", html.includes('aria-label="Outbound operating dashboard"')],
  ["operating dashboard selector exists", app.includes('const outboundOperatingDashboard = document.querySelector("#outboundOperatingDashboard")')],
  ["operating dashboard uses scale decision", app.includes("const scaleDecision = getOutboundScaleDecision()")],
  ["operating dashboard renders decision", app.includes("outboundOperatingDashboard.innerHTML")],
  ["operating dashboard renders next volume", app.includes("Next volume: ${escapeHtml(scaleDecision.recommendedVolume)}")],
  ["operating dashboard renders batch sent", app.includes("Batch 2 sent: ${escapeHtml(scaleDecision.secondSent)}")],
  ["operating dashboard renders open fixes", app.includes("Open fixes: ${escapeHtml(scaleDecision.openFixCount)}")],
  ["README mentions operating dashboard", readme.includes("operating dashboard")],
  ["plan next operating dashboard filters", plan.includes("- Outbound operating closeout")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound operating dashboard test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outbound operating dashboard test passed.");
