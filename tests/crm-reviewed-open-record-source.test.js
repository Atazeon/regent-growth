const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const start = app.indexOf("function openReviewedCrmSync(index)");
const end = app.indexOf("function requeueSingleReviewedCrmSync(index)", start);
const body = start === -1 || end === -1 ? "" : app.slice(start, end);

const checks = [
  ["open reviewed function exists", start !== -1],
  ["open reviewed reads prospect", body.includes("const prospect = prospects[index];")],
  ["open reviewed guards missing prospect", body.includes("if (!prospect) return;")],
  ["open reviewed selects prospect", body.includes("selectedProspectIndex = index;")],
  ["open reviewed activates reviewed view", body.includes('savedViews.dataset.activeView = "crm-reviewed";')],
  ["open reviewed renders prospects", body.includes("renderProspects();")],
  ["open reviewed reports data status", body.includes("setDataStatus(`Opened reviewed CRM sync for ${prospect.company}.`);")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);

if (failures.length > 0) {
  console.error(`CRM reviewed open record test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("CRM reviewed open record test passed.");
