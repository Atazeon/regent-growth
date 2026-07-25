const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const checks = [
  ["Ollama endpoint is local", app.includes('const ollamaEndpoint = "http://127.0.0.1:11434/api/generate";')],
  ["Ollama timeout exists", app.includes("const ollamaTimeoutMs = 150000;")],
  ["qwen3 option exists", html.includes('<option value="qwen3:8b">qwen3:8b</option>')],
  ["llama3 option exists", html.includes('<option value="llama3:latest">llama3:latest</option>')],
  ["qwen fallback exists", html.includes('<option value="qwen2.5:0.5b">qwen2.5:0.5b</option>')],
  ["AI status defaults to qwen3", html.includes("Local AI ready: qwen3:8b")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product Ollama config test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product Ollama config test passed.");
