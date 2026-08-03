const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_PROVIDER_SETUP_REVIEW.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["setup review title exists", doc.includes("# Production Provider Setup Review")],
  ["setup review mentions status", doc.includes("/status")],
  ["setup review mentions adapter readiness", doc.includes("/adapter-readiness")],
  ["setup review mentions readiness export", doc.includes("/adapter-readiness/export")],
  ["setup review mentions replay", doc.includes("/replay")],
  ["setup review mentions replay export", doc.includes("/replay/export")],
  ["setup review mentions audit export", doc.includes("/audit/export")],
  ["setup review mentions checklist json", doc.includes("PRODUCTION_PROVIDER_ADAPTER_CHECKLIST.json")],
  ["setup review blocks real send button", doc.includes("Do not wire a real-send button")],
  ["setup review requires test mailbox", doc.includes("test mailbox")],
  ["project plan next setup review exists", projectPlan.includes("- Production middleware final provider setup review")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production provider setup review doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production provider setup review doc test passed.");
