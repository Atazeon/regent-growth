const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["email draft textarea exists", html.includes('id="emailDraft"')],
  ["mail app button exists", html.includes('id="openMailClientButton"')],
  ["gmail button exists", html.includes('id="openGmailButton"')],
  ["outlook button exists", html.includes('id="openOutlookButton"')],
  ["copy button exists", html.includes('id="copyEmailDraftButton"')],
  ["mark sent button exists", html.includes('id="markEmailSentButton"')],
  ["mail app listener exists", app.includes('openMailClientButton.addEventListener("click", () => openEmailHandoff("mailto"));')],
  ["gmail listener exists", app.includes('openGmailButton.addEventListener("click", () => openEmailHandoff("gmail"));')],
  ["outlook listener exists", app.includes('openOutlookButton.addEventListener("click", () => openEmailHandoff("outlook"));')],
  ["email draft input refreshes status", app.includes('emailDraft.addEventListener("input", () => renderEmailSendStatus());')],
  ["mark sent listener exists", app.includes('markEmailSentButton.addEventListener("click", markEmailSent);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Email action listeners test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Email action listeners test passed.");
