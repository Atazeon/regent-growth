const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["clear brief button", html.includes('id="clearResearchBriefButton"')],
  ["button selector", app.includes('const clearResearchBriefButton = document.querySelector("#clearResearchBriefButton");')],
  ["clear helper", app.includes("function clearResearchBrief()")],
  ["empty guard", app.includes("No research brief to clear for ${prospect.company}.")],
  ["confirmation", app.includes("window.confirm(`Clear saved research brief for ${prospect.company}?")],
  ["clear saved brief", app.includes('prospect.aiBrief = "";')],
  ["clear textarea", app.includes('researchPrompt.value = "";')],
  ["cancel status", app.includes('setDataStatus("Research brief clear canceled.");')],
  ["click listener", app.includes('clearResearchBriefButton.addEventListener("click", clearResearchBrief);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Research brief clear test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Research brief clear test passed.");
