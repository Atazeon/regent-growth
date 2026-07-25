const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const checks = [
  ["README documents search URL env", readme.includes("REGENT_SEARCH_API_URL")],
  ["README documents search key env", readme.includes("REGENT_SEARCH_API_KEY")],
  ["server reads search URL env", server.includes("process.env.REGENT_SEARCH_API_URL")],
  ["server reads search key env", server.includes("process.env.REGENT_SEARCH_API_KEY")],
  ["server exposes search env metadata", server.includes('endpointEnv: "REGENT_SEARCH_API_URL"')],
  ["README documents search endpoints", readme.includes("POST /api/search-sources") && readme.includes("GET /api/search-status")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product search README test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product search README test passed.");
