const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const ids = [
  "refreshTeamBackupsButton",
  "deleteFilteredBackupsButton",
  "restoreTeamBackupInput",
  "teamBackupSearchInput",
  "teamBackupIntegrityFilter",
  "teamBackupProtectionFilter",
  "teamBackupSortSelect"
];

const checks = ids.map((id) => [`${id} backup control exists`, html.includes(`id="${id}"`)]);
checks.push(["manual backup action exists", html.includes('data-action="export-team-backup"')]);
checks.push(["backup refresh behavior exists", app.includes("function refreshTeamBackups")]);
checks.push(["backup delete behavior exists", app.includes("function deleteFilteredTeamBackups")]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product backup controls test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product backup controls test passed.");
