const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["stats helper exists", app.includes("function getOutboundSessionStats()")],
  ["uses discovery queue", app.includes('{ label: "Candidates", value: discoveryQueue.length')],
  ["counts drafts", app.includes("prospects.filter((prospect) => prospect.aiEmail).length")],
  ["counts contacted", app.includes('prospect.responseStatus !== "Not Contacted" || prospect.lastTouch')],
  ["counts warm leads", app.includes("prospects.filter(isWarmLead).length")],
  ["renders stats", app.includes("outboundSessionStats.innerHTML = getOutboundSessionStats().map")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound session stats test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound session stats test passed.");
