const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const server = fs.readFileSync(path.join(root, "local-research-server.js"), "utf8");

const checks = [
  ["search status helper exists", server.includes("function getSearchStatus()")],
  ["search status exposes endpoint env", server.includes('endpointEnv: "REGENT_SEARCH_API_URL"')],
  ["search status exposes key env", server.includes('keyEnv: "REGENT_SEARCH_API_KEY"')],
  ["search source helper exists", server.includes("async function searchSources(query, count = 5)")],
  ["search helper uses timeout", server.includes("const timeout = setTimeout(() => controller.abort(), searchTimeoutMs);")],
  ["search helper sends accept header", server.includes('"Accept": "application/json"')],
  ["search helper supports bearer auth", server.includes("? `Bearer ${searchApiKey}`")],
  ["search endpoint validates query", server.includes('throw new Error("Search query is required.");')],
  ["search endpoint clamps count", server.includes("const count = Math.min(10, Math.max(1, Number(body.count) || 5));")],
  ["search status endpoint exists", server.includes('request.method === "GET" && requestUrl.pathname === "/api/search-status"')],
  ["search sources endpoint exists", server.includes('request.method === "POST" && requestUrl.pathname === "/api/search-sources"')]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`Local server search endpoints test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Local server search endpoints test passed.");
