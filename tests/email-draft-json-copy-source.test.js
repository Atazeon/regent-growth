const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["copy json button", html.includes('id="copyEmailJsonButton"')],
  ["button selector", app.includes('const copyEmailJsonButton = document.querySelector("#copyEmailJsonButton");')],
  ["copy function", app.includes("async function copyEmailJson()")],
  ["empty guard", app.includes("No email draft to copy as JSON for ${prospect.company}.")],
  ["json payload", app.includes("JSON.stringify(getEmailDraftExportRecord(prospect, draft), null, 2)")],
  ["clipboard helper", app.includes("await copyTextWithFallback(JSON.stringify(getEmailDraftExportRecord(prospect, draft), null, 2));")],
  ["direct status", app.includes("Email draft JSON copied for ${prospect.company}.")],
  ["fallback status", app.includes("Email draft JSON selected and copied for ${prospect.company}.")],
  ["click listener", app.includes('copyEmailJsonButton.addEventListener("click", copyEmailJson);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Email draft JSON copy test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Email draft JSON copy test passed.");
