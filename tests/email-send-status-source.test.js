const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function renderEmailSendStatus(prospect = getSelectedProspect())");
const end = app.indexOf("function saveCurrentEmailDraft", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["send status renderer exists", start !== -1],
  ["renderer uses readiness", body.includes("const readiness = getEmailSendReadiness(prospect);")],
  ["renderer sets state", body.includes('emailSendSummary.dataset.state = readiness.ready ? "ready" : "warning";')],
  ["renderer shows ready heading", body.includes("<strong>Ready to send</strong>")],
  ["renderer shows recipient", body.includes("To ${escapeHtml(readiness.recipient)}")],
  ["renderer shows subject", body.includes("Subject: ${escapeHtml(readiness.subject)}")],
  ["renderer shows setup heading", body.includes("<strong>Sending needs setup</strong>")],
  ["renderer shows issues", body.includes('readiness.issues.join(" ")')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Email send status test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Email send status test passed.");
