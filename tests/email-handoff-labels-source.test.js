const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["mail app label", html.includes('title="Open this draft in your default mail app" aria-label="Open this draft in your default mail app"')],
  ["gmail label", html.includes('title="Open this draft in Gmail compose" aria-label="Open this draft in Gmail compose"')],
  ["outlook label", html.includes('title="Open this draft in Outlook compose" aria-label="Open this draft in Outlook compose"')],
  ["copy draft label", html.includes('title="Copy the selected email draft" aria-label="Copy the selected email draft"')],
  ["export draft label", html.includes('title="Export the selected email draft as text" aria-label="Export the selected email draft as text"')],
  ["export json label", html.includes('title="Export the selected email draft as JSON" aria-label="Export the selected email draft as JSON"')],
  ["copy json label", html.includes('title="Copy the selected email draft as JSON" aria-label="Copy the selected email draft as JSON"')],
  ["mark sent label", html.includes('title="Mark this email draft as sent" aria-label="Mark this email draft as sent"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Email handoff labels test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Email handoff labels test passed.");
