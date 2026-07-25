const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const start = server.indexOf("function validateCrmRecords(records)");
const end = server.indexOf("function extractFirst", start);
const body = start === -1 || end === -1 ? "" : server.slice(start, end);

const checks = [
  ["server CRM validator exists", start !== -1],
  ["validator requires non-empty array", body.includes("if (!Array.isArray(records) || records.length === 0) {")],
  ["validator reports missing records", body.includes("At least one CRM record is required.")],
  ["validator checks object shape", body.includes('throw new Error(`CRM record ${index + 1} must be an object.`);')],
  ["validator requires company", body.includes('throw new Error(`CRM record ${index + 1} needs a company name.`);')],
  ["server CRM URL validator exists", server.includes("function getValidatedCrmApiUrl()")],
  ["server URL validator requires full URL", server.includes("CRM API URL is invalid. Use a full http or https webhook URL.")],
  ["server URL validator requires http", server.includes("CRM API URL must use http or https.")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Local server CRM validation test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Local server CRM validation test passed.");
