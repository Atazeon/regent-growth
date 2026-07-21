const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const helperStart = app.indexOf("function setResearchControlsDisabled(disabled)");
const helperEnd = helperStart === -1 ? -1 : app.indexOf("\n}", helperStart);
const helperBody = helperEnd === -1 ? "" : app.slice(helperStart, helperEnd);

const checks = [
  ["disabled helper exists", helperStart !== -1],
  ["research button controlled", helperBody.includes("researchAccountButton.disabled = disabled;")],
  ["check sources button controlled", helperBody.includes("checkResearchSourcesButton.disabled = disabled;")],
  ["search button controlled", helperBody.includes("searchProspectSourcesButton.disabled = disabled;")],
  ["fetch button controlled", helperBody.includes("fetchProspectSourceButton.disabled = disabled;")],
  ["generate button controlled", helperBody.includes("generateBriefButton.disabled = disabled;")],
  ["copy button controlled", helperBody.includes("copyResearchBriefButton.disabled = disabled;")],
  ["export button controlled", helperBody.includes("exportResearchBriefButton.disabled = disabled;")],
  ["clear button controlled", helperBody.includes("clearResearchBriefButton.disabled = disabled;")],
  ["generate uses helper", app.includes("async function generateCompanyBrief()") && app.includes("setResearchControlsDisabled(true);")],
  ["daily ai uses helper", app.includes("runDailyAiButton.disabled = true;") && app.includes("setResearchControlsDisabled(false);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Research control disabled-state test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Research control disabled-state test passed.");
