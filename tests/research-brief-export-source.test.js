const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["export brief button", html.includes('id="exportResearchBriefButton"')],
  ["button selector", app.includes('const exportResearchBriefButton = document.querySelector("#exportResearchBriefButton");')],
  ["disabled with research controls", app.includes("exportResearchBriefButton.disabled = disabled;")],
  ["export text helper", app.includes("function getProspectResearchExportText(prospect)")],
  ["export title", app.includes("Regent Growth prospect research")],
  ["lead score included", app.includes("Lead score: ${leadScore.score} (${leadScore.tier})")],
  ["filename helper", app.includes("function getProspectResearchFilename(prospect)")],
  ["filename slug", app.includes('normalizeCompanyName(prospect.company || "prospect").replace(/\\s+/g, "-")')],
  ["export function", app.includes("function exportResearchBrief()")],
  ["empty guard", app.includes("No research brief to export for ${prospect.company}.")],
  ["download file", app.includes('downloadFile(getProspectResearchFilename(prospect), getProspectResearchExportText(prospect), "text/plain;charset=utf-8");')],
  ["click listener", app.includes('exportResearchBriefButton.addEventListener("click", exportResearchBrief);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Research brief export test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Research brief export test passed.");
