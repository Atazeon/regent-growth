const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const checks = [
  ["static server helper exists", server.includes("function serveStatic(request, response)")],
  ["static server decodes pathname", server.includes("decodeURIComponent(requestUrl.pathname)")],
  ["static server normalizes file path", server.includes("path.normalize(path.join(root, pathname))")],
  ["static server prevents path escape", server.includes("if (!filePath.startsWith(root)) {")],
  ["static server returns forbidden", server.includes("response.end(\"Forbidden\");")],
  ["static server has content types", server.includes("const contentTypes = {")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance server static safety test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance server static safety test passed.");
