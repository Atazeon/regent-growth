const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["check sources button", html.includes('id="checkResearchSourcesButton"')],
  ["button selector", app.includes('const checkResearchSourcesButton = document.querySelector("#checkResearchSourcesButton");')],
  ["button disabled with research controls", app.includes("checkResearchSourcesButton.disabled = disabled;")],
  ["setup wrapper", app.includes("async function checkResearchSourceSetup()")],
  ["running label", app.includes('setButtonWorkingLabel(checkResearchSourcesButton, "Checking...");')],
  ["uses existing check", app.includes("await checkSearchSetup();")],
  ["completion status", app.includes("Source setup check complete. Review the search connector status.")],
  ["click listener", app.includes('checkResearchSourcesButton.addEventListener("click", checkResearchSourceSetup);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Research source setup test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Research source setup test passed.");
