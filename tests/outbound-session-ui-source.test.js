const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["nav links session", html.includes('<a href="#session">Session</a>')],
  ["session section exists", html.includes('id="session"')],
  ["progress exists", html.includes('id="outboundSessionProgress"')],
  ["stats region exists", html.includes('id="outboundSessionStats"')],
  ["list exists", html.includes('id="outboundSessionList"')],
  ["notes form exists", html.includes('id="outboundSessionNotesForm"')],
  ["copy button exists", html.includes('id="copyOutboundSessionButton"')],
  ["download button exists", html.includes('id="downloadOutboundSessionButton"')],
  ["reset button exists", html.includes('id="resetOutboundSessionButton"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound session UI test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound session UI test passed.");
