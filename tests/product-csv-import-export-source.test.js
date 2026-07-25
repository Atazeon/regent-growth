const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["CSV import input exists", html.includes('id="importInput"')],
  ["CSV export button exists", html.includes('id="exportButton"')],
  ["CSV import handler exists", app.includes("function importCsv") || app.includes("importInput.addEventListener")],
  ["CSV export handler exists", app.includes("function exportCsv") || app.includes("exportCsvButton.addEventListener")],
  ["CSV cell helper exists", app.includes("function csvCell")],
  ["download helper exists", app.includes("function downloadFile")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product CSV import/export test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product CSV import/export test passed.");
