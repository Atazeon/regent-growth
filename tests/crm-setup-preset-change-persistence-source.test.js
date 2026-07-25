const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const listenerStart = app.indexOf('crmPresetSelect.addEventListener("change", () => {');
const listenerEnd = app.indexOf("});", listenerStart);
const listenerBody = listenerStart === -1 || listenerEnd === -1 ? "" : app.slice(listenerStart, listenerEnd);
const saveIndex = listenerBody.indexOf("saveCrmPresetPreference();");
const renderIndex = listenerBody.indexOf("renderCrmProviderPreset();");

const checks = [
  ["crm preset change listener exists", listenerStart !== -1],
  ["change listener saves preference", saveIndex !== -1],
  ["change listener rerenders preset", renderIndex !== -1],
  ["change listener saves before rerender", saveIndex !== -1 && renderIndex !== -1 && saveIndex < renderIndex]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup preset change persistence test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup preset change persistence test passed.");
