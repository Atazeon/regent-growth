const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const checks = [
  ["source timeout exists", server.includes("const sourceTimeoutMs = 12000;")],
  ["search timeout exists", server.includes("const searchTimeoutMs = 12000;")],
  ["CRM timeout exists", server.includes("const crmTimeoutMs = 15000;")],
  ["source fetch aborts on timeout", server.includes("setTimeout(() => controller.abort(), sourceTimeoutMs)")],
  ["search aborts on timeout", server.includes("setTimeout(() => controller.abort(), searchTimeoutMs)")],
  ["CRM aborts on timeout", server.includes("setTimeout(() => controller.abort(), crmTimeoutMs)")],
  ["timeouts are cleared", server.includes("clearTimeout(timeout);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance server timeouts test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance server timeouts test passed.");
