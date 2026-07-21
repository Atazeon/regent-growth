const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["label helper exists", app.includes("function setButtonWorkingLabel(button, label = \"\")")],
  ["default label stored", app.includes("button.dataset.defaultLabel = button.textContent;")],
  ["label restored", app.includes("button.textContent = label || button.dataset.defaultLabel;")],
  ["generate label", app.includes('setButtonWorkingLabel(generateBriefButton, "Generating...");')],
  ["fetch label", app.includes('setButtonWorkingLabel(fetchProspectSourceButton, "Fetching...");')],
  ["search label", app.includes('setButtonWorkingLabel(searchProspectSourcesButton, "Searching...");')],
  ["research label", app.includes('setButtonWorkingLabel(researchAccountButton, "Researching...");')],
  ["daily ai label", app.includes('setButtonWorkingLabel(researchAccountButton, "Daily AI...");')],
  ["generate restore", app.includes("setButtonWorkingLabel(generateBriefButton);\n    setResearchControlsDisabled(false);")],
  ["daily ai restore", app.includes("setButtonWorkingLabel(researchAccountButton);\n    setResearchControlsDisabled(false);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Research action labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Research action labels test passed.");
