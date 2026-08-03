const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const planDoc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_MIDDLEWARE_PLAN.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["plan title exists", planDoc.includes("# Production Middleware Implementation Plan")],
  ["plan has skeleton phase", planDoc.includes("## Phase 1: Middleware Skeleton")],
  ["plan keeps stub reference", planDoc.includes("production-provider-stub.js")],
  ["plan requires reviewed schema", planDoc.includes("regent-growth.reviewed-send.v1")],
  ["plan keeps sent false initially", planDoc.includes("Return `sent: false` until provider-specific credentials")],
  ["plan has provider adapter phase", planDoc.includes("## Phase 2: Provider Adapter")],
  ["plan keeps tokens server-side", planDoc.includes("Store OAuth tokens server-side only")],
  ["plan keeps calendar separate", planDoc.includes("Keep calendar booking separate from email sending")],
  ["plan has compliance phase", planDoc.includes("## Phase 3: Compliance Enforcement")],
  ["plan has stop conditions", planDoc.includes("## Stop Conditions")],
  ["project plan next middleware planning exists", projectPlan.includes("- Production middleware implementation planning")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production middleware plan doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production middleware plan doc test passed.");
