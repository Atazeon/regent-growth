const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const checks = [
  ["CRM status helper exists", server.includes("function getCrmStatus()")],
  ["CRM status reports configured state", server.includes("configured: Boolean(crmApiUrl)")],
  ["CRM status reports key state", server.includes("keyConfigured: Boolean(crmApiKey)")],
  ["CRM URL validator exists", server.includes("function getValidatedCrmApiUrl()")],
  ["CRM URL requires full URL", server.includes("CRM API URL is invalid. Use a full http or https webhook URL.")],
  ["CRM URL requires http or https", server.includes("CRM API URL must use http or https.")],
  ["CRM sync endpoint exists", server.includes('request.method === "POST" && requestUrl.pathname === "/api/crm-sync"')],
  ["CRM sync reads records array", server.includes("const records = Array.isArray(body.records) ? body.records : [];")],
  ["CRM sync validates records", server.includes("validateCrmRecords(records);")],
  ["CRM sync calls sync helper", server.includes("const result = await syncCrmRecords(records);")],
  ["CRM sync handles timeout", server.includes('error.name === "AbortError" ? "CRM API timed out." : error.message')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Local server CRM endpoints test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Local server CRM endpoints test passed.");
