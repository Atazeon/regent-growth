const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const startup = app.slice(app.lastIndexOf("renderDailyRunHistory();"));

const checks = [
  ["startup renders Daily AI history", startup.includes("renderDailyRunHistory();")],
  ["startup renders prospects", startup.includes("renderProspects();")],
  ["startup checks search setup", startup.includes("checkSearchSetup();")],
  ["startup checks CRM setup", startup.includes("checkCrmSetup();")],
  ["startup checks team sync", startup.includes("checkTeamSync();")],
  ["startup refreshes team backups", startup.includes("refreshTeamBackups();")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product startup checks test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product startup checks test passed.");
