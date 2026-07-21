const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["research account label", html.includes('title="Use local AI to research the selected account" aria-label="Use local AI to research the selected account"')],
  ["check sources label", html.includes('title="Check whether source search is configured" aria-label="Check whether source search is configured"')],
  ["search sources label", html.includes('title="Search source evidence for the selected prospect" aria-label="Search source evidence for the selected prospect"')],
  ["fetch website label", html.includes('title="Fetch evidence from the selected prospect website" aria-label="Fetch evidence from the selected prospect website"')],
  ["generate brief label", html.includes('title="Generate a shorter brief from selected prospect fields" aria-label="Generate a shorter brief from selected prospect fields"')],
  ["copy brief label", html.includes('title="Copy the selected research brief" aria-label="Copy the selected research brief"')],
  ["export brief label", html.includes('title="Export the selected research brief as text" aria-label="Export the selected research brief as text"')],
  ["export json label", html.includes('title="Export the selected research brief as JSON" aria-label="Export the selected research brief as JSON"')],
  ["copy json label", html.includes('title="Copy the selected research brief as JSON" aria-label="Copy the selected research brief as JSON"')],
  ["clear brief label", html.includes('title="Clear the selected research brief after confirmation" aria-label="Clear the selected research brief after confirmation"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Research toolbar labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Research toolbar labels test passed.");
