const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const textStart = app.indexOf("function getEmailDraftExportText(prospect, draft)");
const textEnd = app.indexOf("function getEmailDraftFilename", textStart);
const textBody = textStart === -1 || textEnd === -1 ? "" : app.slice(textStart, textEnd);
const exportStart = app.indexOf("function exportEmailDraft()");
const exportEnd = app.indexOf("function exportEmailJson", exportStart);
const exportBody = exportStart === -1 || exportEnd === -1 ? "" : app.slice(exportStart, exportEnd);

const checks = [
  ["text export helper exists", textStart !== -1],
  ["text export includes title", textBody.includes("Regent Growth email draft")],
  ["text export includes company", textBody.includes("`Company: ${prospect.company}`")],
  ["text export includes recipient", textBody.includes("`Recipient: ${getEmailRecipient(prospect) || \"Not set\"}`")],
  ["text export includes subject", textBody.includes("`Subject: ${subject}`")],
  ["text export includes body", textBody.includes("body")],
  ["export draft helper exists", exportStart !== -1],
  ["export draft downloads text", exportBody.includes("text/plain;charset=utf-8")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Email export text test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Email export text test passed.");
