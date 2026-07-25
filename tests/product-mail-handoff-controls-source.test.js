const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["mail app control exists", html.includes('id="openMailClientButton"')],
  ["gmail control exists", html.includes('id="openGmailButton"')],
  ["outlook control exists", html.includes('id="openOutlookButton"')],
  ["mail app handoff wired", app.includes('openEmailHandoff("mailto")')],
  ["gmail handoff wired", app.includes('openEmailHandoff("gmail")')],
  ["outlook handoff wired", app.includes('openEmailHandoff("outlook")')],
  ["mark sent control exists", html.includes('id="markEmailSentButton"')],
  ["mark sent wired", app.includes('markEmailSentButton.addEventListener("click", markEmailSent);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product mail handoff controls test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product mail handoff controls test passed.");
