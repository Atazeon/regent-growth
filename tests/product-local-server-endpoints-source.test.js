const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const checks = [
  ["server default port exists", server.includes("process.env.PORT || 5193")],
  ["health endpoint exists", server.includes('requestUrl.pathname === "/api/health"')],
  ["search status endpoint exists", server.includes('requestUrl.pathname === "/api/search-status"')],
  ["search endpoint exists", server.includes('requestUrl.pathname === "/api/search-sources"')],
  ["source fetch endpoint exists", server.includes('requestUrl.pathname === "/api/fetch-source"')],
  ["CRM status endpoint exists", server.includes('requestUrl.pathname === "/api/crm-status"')],
  ["CRM sync endpoint exists", server.includes('requestUrl.pathname === "/api/crm-sync"')],
  ["team prospects endpoint exists", server.includes('requestUrl.pathname === "/api/team-prospects"')],
  ["team backups endpoint exists", server.includes('requestUrl.pathname === "/api/team-backups"')],
  ["team backup endpoint exists", server.includes('requestUrl.pathname === "/api/team-backup"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product local server endpoints test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product local server endpoints test passed.");
