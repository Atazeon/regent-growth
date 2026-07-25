const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const checks = [
  ["README documents team sync", readme.includes("Supports local team sync")],
  ["README documents shared data path", readme.includes("Shared team data and backups are written under `data/`")],
  ["server has shared prospects path", server.includes('path.join(root, "data", "shared-prospects.json")')],
  ["server has backups path", server.includes('path.join(root, "data", "backups")')],
  ["server has team prospects endpoint", server.includes('requestUrl.pathname === "/api/team-prospects"')],
  ["server has team backups endpoint", server.includes('requestUrl.pathname === "/api/team-backups"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product team sync README test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product team sync README test passed.");
