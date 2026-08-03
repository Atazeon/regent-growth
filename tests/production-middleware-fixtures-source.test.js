const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const valid = JSON.parse(fs.readFileSync(path.join(root, "tests", "fixtures", "production-reviewed-send-valid.json"), "utf8"));
const invalid = JSON.parse(fs.readFileSync(path.join(root, "tests", "fixtures", "production-reviewed-send-invalid-automation.json"), "utf8"));
const contract = fs.readFileSync(path.join(root, "docs", "PRODUCTION_MIDDLEWARE_CONTRACT.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

function hasReviewedSendSafety(packet) {
  return packet.schemaVersion === "regent-growth.reviewed-send.v1"
    && packet.automationAllowed === false
    && packet.safety?.humanReviewRequired === true
    && packet.safety?.automaticSendDisabled === true
    && packet.safety?.complianceReviewRequired === true
    && Boolean(packet.provider?.senderEmail)
    && Boolean(packet.message?.to)
    && Boolean(packet.message?.subject)
    && Boolean(packet.message?.body);
}

const checks = [
  ["valid fixture has packet", Boolean(valid.packet)],
  ["valid fixture passes reviewed safety", hasReviewedSendSafety(valid.packet)],
  ["valid fixture has release gate", valid.releaseGate?.ready === true],
  ["valid fixture keeps booking separate", valid.packet.safety?.automaticBookingDisabled === true],
  ["invalid fixture fails reviewed safety", !hasReviewedSendSafety(invalid.packet)],
  ["invalid fixture enables automation for rejection", invalid.packet.automationAllowed === true],
  ["invalid fixture lacks human review", invalid.packet.safety?.humanReviewRequired === false],
  ["invalid fixture lacks recipient", invalid.packet.message?.to === ""],
  ["contract mentions request body", contract.includes("## Request Body")],
  ["contract mentions error response", contract.includes("## Error Response")],
  ["plan next fixture tests exists", plan.includes("- Production middleware fixture tests")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production middleware fixture test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production middleware fixture test passed.");
