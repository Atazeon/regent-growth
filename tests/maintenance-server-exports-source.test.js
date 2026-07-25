const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const exportsBlock = server.slice(server.indexOf("module.exports = {"));
const expected = [
  "firstArrayFromPayload",
  "createSharedProspectsBackup",
  "deleteSharedProspectsBackup",
  "getCrmStatus",
  "getSearchStatus",
  "listSharedProspectsBackups",
  "normalizeSearchResult",
  "pruneSharedProspectsBackups",
  "readSharedProspects",
  "syncCrmRecords",
  "validateSharedProspectsBackupPayload",
  "writeSharedProspects"
];

const checks = expected.map((name) => [`${name} exported`, exportsBlock.includes(name)]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance server exports test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance server exports test passed.");
