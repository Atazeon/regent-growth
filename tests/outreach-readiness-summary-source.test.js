const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["readiness helper", app.includes("function renderSelectedOutreachReadiness(prospect)")],
  ["uses send readiness", app.includes("const readiness = getEmailSendReadiness(prospect);")],
  ["ready text", app.includes("Ready to send to ${readiness.recipient}.")],
  ["blocked text", app.includes('Blocked: ${readiness.issues.join(" ")}')],
  ["detail card", app.includes("<span>Outreach Readiness</span>")],
  ["detail render", app.includes("escapeHtml(renderSelectedOutreachReadiness(prospect))")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Outreach readiness summary test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Outreach readiness summary test passed.");
