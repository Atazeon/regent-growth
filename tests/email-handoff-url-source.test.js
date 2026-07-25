const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function buildEmailHandoffUrl(provider, prospect)");
const end = app.indexOf("function openEmailHandoff(provider)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["handoff URL helper exists", start !== -1],
  ["handoff parses draft parts", body.includes("const { subject, body } = getDraftParts(emailDraft.value);")],
  ["handoff gets recipient", body.includes("const to = getEmailRecipient(prospect);")],
  ["handoff supports Gmail compose", body.includes('new URL("https://mail.google.com/mail/")')],
  ["Gmail URL sets compose view", body.includes('url.searchParams.set("view", "cm");')],
  ["Gmail URL sets recipient", body.includes('url.searchParams.set("to", to);')],
  ["handoff supports Outlook compose", body.includes('new URL("https://outlook.office.com/mail/deeplink/compose")')],
  ["Outlook URL sets subject", body.includes('url.searchParams.set("subject", subject);')],
  ["mailto fallback exists", body.includes('return `mailto:${encodeURIComponent(to)}?${params.toString()}`;')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Email handoff URL test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Email handoff URL test passed.");
