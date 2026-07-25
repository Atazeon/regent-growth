const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("const crmProviderPresets = {");
const end = app.indexOf("function renderCrmProviderPreset()", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const presetIds = ["webhook", "hubspot", "pipedrive", "airtable", "custom"];

const checks = [
  ["crm provider presets exist", start !== -1],
  ...presetIds.map((id) => [`${id} preset has label`, body.includes(`${id}: {\n    label:`)]),
  ...presetIds.map((id) => [`${id} preset has description`, body.includes(`${id}: {`) && body.slice(body.indexOf(`${id}: {`), body.indexOf("  },", body.indexOf(`${id}: {`))).includes("description:")]),
  ...presetIds.map((id) => [`${id} preset has snippet`, body.includes(`${id}: {`) && body.slice(body.indexOf(`${id}: {`), body.indexOf("  },", body.indexOf(`${id}: {`))).includes("snippet:")]),
  ["snippets include CRM endpoint env var", body.includes("$env:REGENT_CRM_API_URL=")],
  ["snippets include CRM API key env var", body.includes("$env:REGENT_CRM_API_KEY=")],
  ["snippets start local server", body.includes("local-research-server.js")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM setup preset snippet test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM setup preset snippet test passed.");
