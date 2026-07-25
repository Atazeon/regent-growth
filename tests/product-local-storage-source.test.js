const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const checks = [
  ["prospect load uses local storage", app.includes("const savedProspects = localStorage.getItem(storageKey);")],
  ["prospect save uses local storage", app.includes("localStorage.setItem(storageKey, JSON.stringify(prospects));")],
  ["prompt templates load from local storage", app.includes("const savedTemplates = localStorage.getItem(promptStorageKey);")],
  ["prompt templates save to local storage", app.includes("localStorage.setItem(promptStorageKey, JSON.stringify(promptTemplates));")],
  ["discovery queue loads from local storage", app.includes("const savedQueue = localStorage.getItem(discoveryStorageKey);")],
  ["discovery queue saves to local storage", app.includes("localStorage.setItem(discoveryStorageKey, JSON.stringify(discoveryQueue));")],
  ["daily history loads from local storage", app.includes("const savedHistory = localStorage.getItem(dailyRunHistoryStorageKey);")],
  ["daily history saves to local storage", app.includes("localStorage.setItem(dailyRunHistoryStorageKey, JSON.stringify(dailyRunHistory));")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Product local storage test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Product local storage test passed.");
