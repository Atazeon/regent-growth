const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["guidance helper exists", app.includes("function getLocalResearchServerGuidance(feature)")],
  ["guidance includes command", app.includes("Run: node local-research-server.js")],
  ["guidance includes url", app.includes("http://127.0.0.1:5193/index.html")],
  ["source fetch uses guidance", app.includes('getLocalResearchServerGuidance("Source fetch")')],
  ["source search uses guidance", app.includes('getLocalResearchServerGuidance("Source search")')],
  ["search setup uses guidance", app.includes('getLocalResearchServerGuidance("Search setup check")')],
  ["search test uses guidance", app.includes('getLocalResearchServerGuidance("Search test")')],
  ["crm setup uses guidance", app.includes('getLocalResearchServerGuidance("CRM setup check")')],
  ["old vague guidance removed", !app.includes("open the local URL")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Local server guidance test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Local server guidance test passed.");
