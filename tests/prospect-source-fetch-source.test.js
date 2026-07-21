const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["fetch website button", html.includes('id="fetchProspectSourceButton"')],
  ["button selector", app.includes('const fetchProspectSourceButton = document.querySelector("#fetchProspectSourceButton");')],
  ["selected prospect fetch function", app.includes("async function fetchSelectedProspectSource()")],
  ["source endpoint reuse", app.includes("await fetchEvidenceForCandidate(evidenceTarget);")],
  ["brief evidence append", app.includes('appendProspectEvidenceBlock(prospect, "Website evidence", evidenceTarget.sourceNotes);')],
  ["response note audit", app.includes("Website evidence fetched from ${url}.")],
  ["research lockout", app.includes("setResearchControlsDisabled(true);")],
  ["click listener", app.includes('fetchProspectSourceButton.addEventListener("click", fetchSelectedProspectSource);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Prospect source fetch test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Prospect source fetch test passed.");
