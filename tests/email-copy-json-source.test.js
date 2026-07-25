const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function copyEmailJson()");
const end = app.indexOf("function saveCurrentResearchBrief", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["copy email JSON helper exists", start !== -1],
  ["copy JSON saves draft first", body.includes("const prospect = saveCurrentEmailDraft();")],
  ["copy JSON blocks missing prospect", body.includes("if (!prospect) return;")],
  ["copy JSON blocks empty draft", body.includes("No email draft to copy as JSON for ${prospect.company}.")],
  ["copy JSON serializes export record", body.includes("JSON.stringify(getEmailDraftExportRecord(prospect, draft), null, 2)")],
  ["copy JSON uses clipboard fallback", body.includes("await copyTextWithFallback(")],
  ["copy JSON reports success", body.includes("Email draft JSON copied for ${prospect.company}.")],
  ["copy JSON reports fallback", body.includes("Email draft JSON selected and copied for ${prospect.company}.")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Email copy JSON test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Email copy JSON test passed.");
