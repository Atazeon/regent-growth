const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const start = server.indexOf("function validateSharedProspectsBackupPayload(payload)");
const end = server.indexOf("function createSharedProspectsBackupAudit", start);
const body = start === -1 || end === -1 ? "" : server.slice(start, end);

const checks = [
  ["backup integrity helper exists", start !== -1],
  ["integrity rejects non-object", body.includes("Backup file must contain a JSON object.")],
  ["integrity requires records array", body.includes("Backup file must contain a records array.")],
  ["integrity warns on history type", body.includes("History is not an array and will be ignored during restore.")],
  ["integrity checks checksum", body.includes("Backup checksum does not match the current file contents.")],
  ["integrity returns status", body.includes("status: issues.length > 0 ? \"invalid\"")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance backup integrity test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance backup integrity test passed.");
