const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const start = server.indexOf("async function syncCrmRecords(records)");
const end = server.indexOf("function serveStatic", start);
const body = start === -1 || end === -1 ? "" : server.slice(start, end);

const checks = [
  ["server CRM sync helper exists", start !== -1],
  ["server sync requires config", body.includes("CRM API is not configured. Set REGENT_CRM_API_URL")],
  ["server sync validates URL", body.includes("const url = getValidatedCrmApiUrl();")],
  ["server sync has timeout", body.includes("const timeout = setTimeout(() => controller.abort(), crmTimeoutMs);")],
  ["server sync sends JSON headers", body.includes('"Content-Type": "application/json"')],
  ["server sync supports API key", body.includes("if (crmApiKey) {")],
  ["server sync posts records", body.includes("records") && body.includes('source: "regent-growth"')],
  ["server sync handles JSON response", body.includes('contentType.includes("application/json")')],
  ["server sync rejects non-ok", body.includes("if (!response.ok) {")],
  ["server sync returns accepted count", body.includes("acceptedCount: records.length")],
  ["server sync clears timeout", body.includes("clearTimeout(timeout);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Local server CRM sync request test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Local server CRM sync request test passed.");
