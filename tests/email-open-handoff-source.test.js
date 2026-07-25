const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function openEmailHandoff(provider)");
const end = app.indexOf("async function copyEmailDraft", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["open handoff helper exists", start !== -1],
  ["open handoff saves draft first", body.includes("const prospect = saveCurrentEmailDraft();")],
  ["open handoff checks readiness", body.includes("const readiness = getEmailSendReadiness(prospect);")],
  ["open handoff blocks when not ready", body.includes("if (!readiness.ready) {")],
  ["open handoff re-renders status", body.includes("renderEmailSendStatus(prospect);")],
  ["open handoff reports provider label", body.includes("getEmailProviderLabel(provider)")],
  ["open handoff uses noopener", body.includes('window.open(buildEmailHandoffUrl(provider, prospect), "_blank", "noopener,noreferrer");')],
  ["open handoff tells user to mark sent", body.includes("Review and send there, then mark sent here.")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Email open handoff test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Email open handoff test passed.");
