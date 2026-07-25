const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function renderCrmProviderPreset()");
const end = app.indexOf("function restoreCrmPresetPreference()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["render function exists", start !== -1],
  ["render falls back to webhook preset", body.includes("const preset = crmProviderPresets[crmPresetSelect.value] || crmProviderPresets.webhook;")],
  ["render updates snippet", body.includes("crmPresetSnippet.textContent = preset.snippet;")],
  ["render updates status", body.includes("setCrmSetupStatus(`${preset.label}: ${preset.description}`);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup render preset fallback test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup render preset fallback test passed.");
