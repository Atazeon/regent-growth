const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["export json button", html.includes('id="exportEmailJsonButton"')],
  ["button selector", app.includes('const exportEmailJsonButton = document.querySelector("#exportEmailJsonButton");')],
  ["record helper", app.includes("function getEmailDraftExportRecord(prospect, draft)")],
  ["subject parsed", app.includes("const { subject, body } = getDraftParts(draft);")],
  ["recipient field", app.includes("recipient: getEmailRecipient(prospect)")],
  ["subject field", app.includes("subject,")],
  ["body field", app.includes("body,")],
  ["json export function", app.includes("function exportEmailJson()")],
  ["empty guard", app.includes("No email draft to export as JSON for ${prospect.company}.")],
  ["json filename", app.includes('getEmailDraftFilename(prospect).replace(/\\.txt$/, ".json")')],
  ["json download", app.includes("JSON.stringify(getEmailDraftExportRecord(prospect, draft), null, 2)")],
  ["click listener", app.includes('exportEmailJsonButton.addEventListener("click", exportEmailJson);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Email draft JSON export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Email draft JSON export test passed.");
