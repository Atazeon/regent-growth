const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const start = server.indexOf("function pruneSharedProspectsBackups()");
const end = server.indexOf("function getSharedProspectsBackup", start);
const body = start === -1 || end === -1 ? "" : server.slice(start, end);

const checks = [
  ["backup retention helper exists", start !== -1],
  ["retention reads summaries", body.includes("const backups = readSharedProspectsBackupSummaries();")],
  ["retention protects protected backups", body.includes("if (backup.protected) {")],
  ["retention uses configured limit", body.includes("if (keptUnprotected <= maxSharedProspectsBackups) {")],
  ["retention deletes old files", body.includes("fs.unlinkSync(path.join(sharedBackupsDir, backup.filename));")],
  ["retention returns deleted count", body.includes("deletedCount: deleted.length")],
  ["retention returns protected count", body.includes("protectedCount")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance backup retention test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance backup retention test passed.");
