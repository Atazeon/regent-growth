const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["copy email function", app.includes("async function copyEmailDraft()")],
  ["draft local value", app.includes("const draft = emailDraft.value.trim();")],
  ["empty guard", app.includes("No email draft to copy for ${prospect.company}.")],
  ["draft clipboard helper", app.includes("await copyTextWithFallback(draft);")],
  ["direct copy status", app.includes("Email draft copied for ${prospect.company}.")],
  ["fallback copy status", app.includes("Email draft selected and copied for ${prospect.company}.")],
  ["click listener", app.includes('copyEmailDraftButton.addEventListener("click", copyEmailDraft);')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Email draft copy test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Email draft copy test passed.");
