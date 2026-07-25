const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const itemBlock = app.match(/const outboundSessionItems = \[([\s\S]*?)\];/);
const itemIds = itemBlock ? Array.from(itemBlock[1].matchAll(/id: "([^"]+)"/g)).map((match) => match[1]) : [];
const itemAreas = itemBlock ? Array.from(itemBlock[1].matchAll(/area: "([^"]+)"/g)).map((match) => match[1]) : [];

const checks = [
  ["item block exists", Boolean(itemBlock)],
  ["has 25 checklist items", itemIds.length === 25],
  ["ids are unique", new Set(itemIds).size === itemIds.length],
  ["covers setup", itemAreas.includes("Setup")],
  ["covers discovery", itemAreas.includes("Discovery")],
  ["covers AI research", itemAreas.includes("AI Research")],
  ["covers outreach", itemAreas.includes("Outreach")],
  ["covers sequence", itemAreas.includes("Sequence")],
  ["covers response", itemAreas.includes("Response")],
  ["covers handoff", itemAreas.includes("Handoff")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Outbound session items test failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Outbound session items test passed.");
