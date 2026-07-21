const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["export draft button", html.includes('id="exportEmailDraftButton"')],
  ["button selector", app.includes('const exportEmailDraftButton = document.querySelector("#exportEmailDraftButton");')],
  ["export text helper", app.includes("function getEmailDraftExportText(prospect, draft)")],
  ["export title", app.includes("Regent Growth email draft")],
  ["recipient included", app.includes('`Recipient: ${getEmailRecipient(prospect) || "Not set"}`')],
  ["subject parsed", app.includes("const { subject, body } = getDraftParts(draft);")],
  ["filename helper", app.includes("function getEmailDraftFilename(prospect)")],
  ["export function", app.includes("function exportEmailDraft()")],
  ["empty guard", app.includes("No email draft to export for ${prospect.company}.")],
  ["download file", app.includes('downloadFile(getEmailDraftFilename(prospect), getEmailDraftExportText(prospect, draft), "text/plain;charset=utf-8");')],
  ["click listener", app.includes('exportEmailDraftButton.addEventListener("click", exportEmailDraft);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Email draft export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Email draft export test passed.");
