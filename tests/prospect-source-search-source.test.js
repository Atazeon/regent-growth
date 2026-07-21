const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["search sources button", html.includes('id="searchProspectSourcesButton"')],
  ["button selector", app.includes('const searchProspectSourcesButton = document.querySelector("#searchProspectSourcesButton");')],
  ["query builder", app.includes("function buildProspectSearchQuery(prospect)")],
  ["selected search function", app.includes("async function searchSelectedProspectSources()")],
  ["search endpoint reuse", app.includes("const response = await fetch(sourceSearchEndpoint")],
  ["source evidence label", app.includes("Source search evidence\\n${formatSearchEvidence(result)}")],
  ["result count status", app.includes("source result${result.results.length === 1 ? \"\" : \"s\"}")],
  ["research lockout", app.includes("setResearchControlsDisabled(true);")],
  ["click listener", app.includes('searchProspectSourcesButton.addEventListener("click", searchSelectedProspectSources);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Prospect source search test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Prospect source search test passed.");
