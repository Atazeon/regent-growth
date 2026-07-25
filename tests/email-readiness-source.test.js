const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getEmailSendReadiness(prospect = getSelectedProspect())");
const end = app.indexOf("function renderEmailSendStatus", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["email readiness helper exists", start !== -1],
  ["readiness trims draft", body.includes("const draft = emailDraft.value.trim();")],
  ["readiness parses subject and body", body.includes("const { subject, body } = getDraftParts(draft);")],
  ["readiness reads recipient", body.includes("const recipient = prospect ? getEmailRecipient(prospect).trim() : \"\";")],
  ["readiness requires selected prospect", body.includes('if (!prospect) issues.push("Select a prospect.");')],
  ["readiness requires contact email", body.includes('if (!recipient) issues.push("Add a contact email.");')],
  ["readiness validates email format", body.includes('if (recipient && !isValidEmailAddress(recipient)) issues.push("Fix the contact email format.");')],
  ["readiness requires draft", body.includes('if (!draft) issues.push("Write or generate an email draft.");')],
  ["readiness returns ready flag", body.includes("ready: issues.length === 0")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Email readiness test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Email readiness test passed.");
