const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function renderCrmProviderPreset()");
const end = app.indexOf("function restoreCrmPresetPreference()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["render preset function exists", start !== -1],
  ["render selects preset", body.includes("const preset = crmProviderPresets[crmPresetSelect.value] || crmProviderPresets.webhook;")],
  ["render updates snippet before status", body.indexOf("crmPresetSnippet.textContent = preset.snippet;") !== -1 && body.indexOf("setCrmSetupStatus") !== -1 && body.indexOf("crmPresetSnippet.textContent = preset.snippet;") < body.indexOf("setCrmSetupStatus")],
  ["render status includes label and description", body.includes("setCrmSetupStatus(`${preset.label}: ${preset.description}`);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup preset status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup preset status test passed.");
