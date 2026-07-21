const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["field preview region labelled", html.includes('<div id="crmFieldPreview" class="crm-field-preview" role="region" aria-labelledby="crmFieldPreviewHeading">')],
  ["empty preview heading exists", html.includes('<h3 id="crmFieldPreviewHeading" class="sr-only">CRM field mapping preview</h3>')],
  ["rendered preview heading id retained", app.includes('<h3 id="crmFieldPreviewHeading">${escapeHtml(record.company || "Selected account")}</h3>')],
  ["crm field preview selector retained", app.includes('const crmFieldPreview = document.querySelector("#crmFieldPreview");')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM field preview region test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM field preview region test passed.");
