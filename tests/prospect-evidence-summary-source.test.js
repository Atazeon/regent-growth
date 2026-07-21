const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["summary helper", app.includes("function getProspectEvidenceSummary(prospect)")],
  ["heading parser", app.includes("/^(Website evidence|Source search evidence) \\(([^)]+)\\)/gm")],
  ["website count", app.includes('matches.filter((match) => match[1] === "Website evidence").length')],
  ["search count", app.includes('matches.filter((match) => match[1] === "Source search evidence").length')],
  ["render helper", app.includes("function renderProspectEvidenceSummary(prospect)")],
  ["empty summary", app.includes("No source evidence saved yet.")],
  ["latest timestamp", app.includes("Latest ${formatDateTime(summary.latestAt)}")],
  ["detail card", app.includes("<span>Research Evidence</span>")],
  ["detail render", app.includes("escapeHtml(renderProspectEvidenceSummary(prospect))")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Prospect evidence summary test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Prospect evidence summary test passed.");
