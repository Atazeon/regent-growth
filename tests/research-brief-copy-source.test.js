const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["copy brief button", html.includes('id="copyResearchBriefButton"')],
  ["button selector", app.includes('const copyResearchBriefButton = document.querySelector("#copyResearchBriefButton");')],
  ["save helper", app.includes("function saveCurrentResearchBrief()")],
  ["brief saved from textarea", app.includes("prospect.aiBrief = researchPrompt.value.trim();")],
  ["copy helper", app.includes("async function copyResearchBrief()")],
  ["empty guard", app.includes("No research brief to copy for ${prospect.company}.")],
  ["clipboard write", app.includes("await navigator.clipboard.writeText(prospect.aiBrief);")],
  ["fallback select", app.includes("researchPrompt.select();")],
  ["click listener", app.includes('copyResearchBriefButton.addEventListener("click", copyResearchBrief);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Research brief copy test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Research brief copy test passed.");
