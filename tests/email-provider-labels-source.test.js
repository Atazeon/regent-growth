const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function getEmailProviderLabel(provider)");
const end = app.indexOf("function isValidEmailAddress", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["provider label helper exists", start !== -1],
  ["gmail label exists", body.includes('gmail: "Gmail"')],
  ["outlook label exists", body.includes('outlook: "Outlook"')],
  ["mailto label exists", body.includes('mailto: "Mail app"')],
  ["unknown provider fallback exists", body.includes('return labels[provider] || "Email";')],
  ["email validator exists", app.includes("function isValidEmailAddress(value)")],
  ["email validator trims values", app.includes("value.trim()")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Email provider labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Email provider labels test passed.");
