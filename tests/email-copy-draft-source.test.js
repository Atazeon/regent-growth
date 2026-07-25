const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("async function copyEmailDraft()");
const end = app.indexOf("function getEmailDraftExportText", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["copy draft helper exists", start !== -1],
  ["copy draft saves first", body.includes("const prospect = saveCurrentEmailDraft();")],
  ["copy draft guards missing prospect", body.includes("if (!prospect) return;")],
  ["copy draft trims editor", body.includes("const draft = emailDraft.value.trim();")],
  ["copy draft blocks empty draft", body.includes("No email draft to copy for ${prospect.company}.")],
  ["copy draft uses clipboard fallback", body.includes("await copyTextWithFallback(draft);")],
  ["copy draft reports direct copy", body.includes("Email draft copied for ${prospect.company}.")],
  ["copy draft reports fallback selection", body.includes("Email draft selected and copied for ${prospect.company}.")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Email copy draft test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Email copy draft test passed.");
