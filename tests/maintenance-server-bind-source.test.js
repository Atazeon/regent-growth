const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const checks = [
  ["server uses configurable port", server.includes("const port = Number(process.env.PORT || 5193);")],
  ["server only listens when main", server.includes("if (require.main === module) {")],
  ["server binds loopback", server.includes('server.listen(port, "127.0.0.1"')],
  ["server logs local URL", server.includes("Regent Growth local research server: http://127.0.0.1:${port}/index.html")],
  ["server exports helpers", server.includes("module.exports = {")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance server bind test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance server bind test passed.");
