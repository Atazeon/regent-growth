const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function restoreCrmPresetPreference()");
const end = app.indexOf("function saveCrmPresetPreference()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["restore function exists", start !== -1],
  ["restore reads saved preset", body.includes("const savedPreset = localStorage.getItem(crmPresetStorageKey);")],
  ["restore ignores empty saved preset", body.includes("if (savedPreset && crmProviderPresets[savedPreset]) {")],
  ["restore validates saved preset against presets", body.includes("crmProviderPresets[savedPreset]")],
  ["restore only applies valid saved preset", body.includes("crmPresetSelect.value = savedPreset;")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup invalid preset fallback test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup invalid preset fallback test passed.");
