const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const doc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_PROVIDER_SEND_FEATURE_FLAGS.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["feature flag doc title exists", doc.includes("# Provider Send Feature Flag Contract")],
  ["feature flag doc documents gmail endpoint", doc.includes("GET http://127.0.0.1:5195/provider-send-feature-flags?provider=gmail")],
  ["feature flag doc documents outlook endpoint", doc.includes("GET http://127.0.0.1:5195/provider-send-feature-flags?provider=outlook")],
  ["feature flag doc names schema", doc.includes("regent-growth.provider-send-feature-flag-contract.v1")],
  ["feature flag doc blocks approval", doc.includes("approvedForRealSend: false")],
  ["feature flag doc blocks canSend", doc.includes("canSend: false")],
  ["feature flag doc keeps sent disabled", doc.includes("sentEnabled: false")],
  ["feature flag doc keeps booked disabled", doc.includes("bookedEnabled: false")],
  ["feature flag doc names gmail reviewed", doc.includes("REGENT_GMAIL_SEND_ADAPTER_REVIEWED")],
  ["feature flag doc names gmail can send", doc.includes("REGENT_GMAIL_CAN_SEND")],
  ["feature flag doc names outlook reviewed", doc.includes("REGENT_OUTLOOK_SEND_ADAPTER_REVIEWED")],
  ["feature flag doc names outlook can send", doc.includes("REGENT_OUTLOOK_CAN_SEND")],
  ["feature flag doc names enabled flags", doc.includes("enabledFlags")],
  ["feature flag doc names missing flags", doc.includes("missingFlags")],
  ["feature flag doc blocks send approval", doc.includes("not send approval")],
  ["feature flag doc requires separate approval", doc.includes("separate implementation approval")],
  ["project plan next feature flag docs exists", projectPlan.includes("- First provider send adapter feature flag contract docs")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production provider send feature flag contract doc test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production provider send feature flag contract doc test passed.");
