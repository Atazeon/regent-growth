const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function saveCurrentEmailDraft()");
const end = app.indexOf("function buildEmailHandoffUrl", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["save draft helper exists", start !== -1],
  ["save draft gets selected prospect", body.includes("const prospect = getSelectedProspect();")],
  ["save draft guards empty selection", body.includes("if (!prospect) return null;")],
  ["save draft trims editor value", body.includes("prospect.aiEmail = emailDraft.value.trim();")],
  ["save draft persists prospects", body.includes("saveProspects();")],
  ["save draft rerenders detail", body.includes("renderSelectedDetail();")],
  ["save draft rerenders send status", body.includes("renderEmailSendStatus(prospect);")],
  ["save draft returns prospect", body.includes("return prospect;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Email save draft test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Email save draft test passed.");
