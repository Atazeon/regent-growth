const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["export json button", html.includes('id="exportResearchJsonButton"')],
  ["button selector", app.includes('const exportResearchJsonButton = document.querySelector("#exportResearchJsonButton");')],
  ["disabled with research controls", app.includes("exportResearchJsonButton.disabled = disabled;")],
  ["record helper", app.includes("function getProspectResearchExportRecord(prospect)")],
  ["export timestamp", app.includes("exportedAt: new Date().toISOString()")],
  ["lead score field", app.includes("leadScore: leadScore.score")],
  ["brief field", app.includes("aiBrief: prospect.aiBrief")],
  ["json export function", app.includes("function exportResearchJson()")],
  ["json filename", app.includes('getProspectResearchFilename(prospect).replace(/\\.txt$/, ".json")')],
  ["json download", app.includes("JSON.stringify(getProspectResearchExportRecord(prospect), null, 2)")],
  ["click listener", app.includes('exportResearchJsonButton.addEventListener("click", exportResearchJson);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Research JSON export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Research JSON export test passed.");
