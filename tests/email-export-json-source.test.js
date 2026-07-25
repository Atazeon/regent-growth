const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const recordStart = app.indexOf("function getEmailDraftExportRecord(prospect, draft)");
const recordEnd = app.indexOf("function exportEmailDraft", recordStart);
const recordBody = recordStart === -1 || recordEnd === -1 ? "" : app.slice(recordStart, recordEnd);
const exportStart = app.indexOf("function exportEmailJson()");
const exportEnd = app.indexOf("async function copyEmailJson", exportStart);
const exportBody = exportStart === -1 || exportEnd === -1 ? "" : app.slice(exportStart, exportEnd);

const checks = [
  ["JSON export record helper exists", recordStart !== -1],
  ["record includes exportedAt", recordBody.includes("exportedAt: new Date().toISOString()")],
  ["record includes company", recordBody.includes("company: prospect.company")],
  ["record includes recipient", recordBody.includes("recipient: getEmailRecipient(prospect)")],
  ["record includes subject", recordBody.includes("subject,")],
  ["record includes draft", recordBody.includes("draft")],
  ["JSON export helper exists", exportStart !== -1],
  ["JSON export uses .json filename", exportBody.includes('replace(/\\.txt$/, ".json")')],
  ["JSON export downloads JSON", exportBody.includes("application/json;charset=utf-8")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Email export JSON test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Email export JSON test passed.");
