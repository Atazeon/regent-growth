const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const endpoints = [
  'const sourceFetchEndpoint = "/api/fetch-source";',
  'const sourceSearchEndpoint = "/api/search-sources";',
  'const sourceSearchStatusEndpoint = "/api/search-status";',
  'const crmStatusEndpoint = "/api/crm-status";',
  'const crmSyncEndpoint = "/api/crm-sync";',
  'const teamProspectsEndpoint = "/api/team-prospects";',
  'const teamBackupsEndpoint = "/api/team-backups";',
  'const teamBackupEndpoint = "/api/team-backup";'
];

const checks = endpoints.map((endpoint) => [`${endpoint} exists`, app.includes(endpoint)]);

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance app endpoints test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance app endpoints test passed.");
