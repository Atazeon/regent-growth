const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["AI timeout constant exists", app.includes("const ollamaTimeoutMs = 150000;")],
  ["generateWithOllama helper exists", app.includes("async function generateWithOllama(prompt, numPredict = 260)")],
  ["Ollama generation uses abort controller", app.includes("const controller = new AbortController();")],
  ["Ollama generation uses timeout", app.includes("setTimeout(() => controller.abort(), ollamaTimeoutMs)")],
  ["Ollama generation disables stream", app.includes("stream: false")],
  ["Ollama generation disables thinking", app.includes("think: false")],
  ["Ollama generation clears timeout", app.includes("clearTimeout(timeoutId);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Maintenance AI timeout test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Maintenance AI timeout test passed.");
