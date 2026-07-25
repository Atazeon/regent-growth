const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const restoreStart = app.indexOf("function restoreCrmPresetPreference()");
const saveStart = app.indexOf("function saveCrmPresetPreference()");
const checkSetupStart = app.indexOf("async function checkCrmSetup()");
const restoreBody = restoreStart === -1 || saveStart === -1 ? "" : app.slice(restoreStart, saveStart);
const saveBody = saveStart === -1 || checkSetupStart === -1 ? "" : app.slice(saveStart, checkSetupStart);
const startupRestoreIndex = app.lastIndexOf("restoreCrmPresetPreference();");
const startupRenderIndex = app.lastIndexOf("renderCrmProviderPreset();");

const checks = [
  ["crm preset storage key exists", app.includes('const crmPresetStorageKey = "regent-growth-crm-preset";')],
  ["restore function exists", restoreStart !== -1],
  ["restore reads saved preset", restoreBody.includes("localStorage.getItem(crmPresetStorageKey)")],
  ["restore validates saved preset", restoreBody.includes("savedPreset && crmProviderPresets[savedPreset]")],
  ["restore applies saved preset", restoreBody.includes("crmPresetSelect.value = savedPreset;")],
  ["save function exists", saveStart !== -1],
  ["save writes selected preset", saveBody.includes("localStorage.setItem(crmPresetStorageKey, crmPresetSelect.value);")],
  ["startup restores before render", startupRestoreIndex !== -1 && startupRenderIndex !== -1 && startupRestoreIndex < startupRenderIndex]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup persistence test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup persistence test passed.");
