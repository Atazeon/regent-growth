const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["summary helper", app.includes("function renderEmailDraftSummary(prospect)")],
  ["empty summary", app.includes("No saved email draft yet.")],
  ["draft parts used", app.includes("const { subject, body } = getDraftParts(prospect.aiEmail);")],
  ["word count", app.includes("const wordCount = body.split(/\\s+/).filter(Boolean).length;")],
  ["subject summary", app.includes("Subject: ${subject} | ${wordCount} body word${wordCount === 1 ? \"\" : \"s\"}")],
  ["detail card", app.includes("<span>Email Draft Summary</span>")],
  ["detail render", app.includes("escapeHtml(renderEmailDraftSummary(prospect))")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Email draft summary test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Email draft summary test passed.");
