const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["escapeHtml helper exists", app.includes("function escapeHtml(value)")],
  ["escapeHtml escapes ampersand", app.includes('.replaceAll("&", "&amp;")')],
  ["escapeHtml escapes less-than", app.includes('.replaceAll("<", "&lt;")')],
  ["escapeHtml escapes greater-than", app.includes('.replaceAll(">", "&gt;")')],
  ["external URL helper exists", app.includes("function toExternalUrl(value)")],
  ["copy fallback helper exists", app.includes("async function copyTextWithFallback(text)")],
  ["download helper exists", app.includes("function downloadFile(filename, content, type)")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance app safety helpers test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance app safety helpers test passed.");
