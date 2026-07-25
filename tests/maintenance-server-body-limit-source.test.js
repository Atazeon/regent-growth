const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const checks = [
  ["body limit constant exists", server.includes("const maxBodyBytes = 1024 * 1024;")],
  ["readJsonBody helper exists", server.includes("function readJsonBody(request)")],
  ["body chunks accumulate", server.includes("body += chunk;")],
  ["large request rejected", server.includes('reject(new Error("Request body is too large."));')],
  ["large request destroys connection", server.includes("request.destroy();")],
  ["JSON parse happens on end", server.includes('request.on("end", () => {')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance server body limit test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance server body limit test passed.");
