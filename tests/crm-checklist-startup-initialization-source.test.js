const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const bindIndex = app.lastIndexOf("bindCrmChecklistState();");
const templatesIndex = app.indexOf("renderPromptTemplates();", bindIndex);
const presetsIndex = app.indexOf("renderCrmProviderPreset();", bindIndex);
const queueIndex = app.indexOf("renderDiscoveryQueue();", bindIndex);

const checks = [
  ["checklist startup call exists", bindIndex !== -1],
  ["prompt template startup call exists", templatesIndex !== -1],
  ["crm preset startup call exists", presetsIndex !== -1],
  ["discovery queue startup call exists", queueIndex !== -1],
  ["checklist initializes before prompt templates", bindIndex !== -1 && templatesIndex !== -1 && bindIndex < templatesIndex],
  ["checklist initializes before crm presets", bindIndex !== -1 && presetsIndex !== -1 && bindIndex < presetsIndex],
  ["checklist initializes before discovery queue", bindIndex !== -1 && queueIndex !== -1 && bindIndex < queueIndex]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM checklist startup initialization test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM checklist startup initialization test passed.");
