const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");

const checks = [
  ["README title exists", readme.includes("# Regent Growth")],
  ["README describes local-first AI", readme.includes("local-first AI sales operating system")],
  ["README documents Ollama", readme.includes("Ollama running locally at `http://127.0.0.1:11434`")],
  ["README documents qwen3 default", readme.includes("The default AI model is `qwen3:8b`.")],
  ["README documents local server command", readme.includes("local-research-server.js")],
  ["README documents local URL", readme.includes("http://127.0.0.1:5193/index.html")],
  ["README documents CRM setup", readme.includes("REGENT_CRM_API_URL")],
  ["README documents tests", readme.includes("tests\\run-source-tests.js")],
  ["README documents ignored data", readme.includes("Runtime data and `.env` files are ignored by Git.")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`README finalization test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("README finalization test passed.");
