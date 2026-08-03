const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const stubSource = fs.readFileSync(path.join(root, "production-provider-stub.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const contract = fs.readFileSync(path.join(root, "docs", "PRODUCTION_MIDDLEWARE_CONTRACT.md"), "utf8");
const valid = require("./fixtures/production-reviewed-send-valid.json");
const invalid = require("./fixtures/production-reviewed-send-invalid-automation.json");
const { validateReviewedSendRequest, createStubReviewedSendResponse } = require("../production-provider-stub");

const validValidation = validateReviewedSendRequest(valid);
const invalidValidation = validateReviewedSendRequest(invalid);
const validResponse = createStubReviewedSendResponse(valid);
const invalidResponse = createStubReviewedSendResponse(invalid);

const checks = [
  ["stub file creates server", stubSource.includes("http.createServer")],
  ["stub has reviewed send route", stubSource.includes('requestUrl.pathname === "/reviewed-send"')],
  ["stub has health route", stubSource.includes('requestUrl.pathname === "/health"')],
  ["stub exports validator", typeof validateReviewedSendRequest === "function"],
  ["stub exports response helper", typeof createStubReviewedSendResponse === "function"],
  ["valid fixture accepted", validValidation.accepted === true],
  ["invalid fixture rejected", invalidValidation.accepted === false],
  ["invalid reports automation issue", invalidValidation.issues.some((issue) => issue.includes("automationAllowed"))],
  ["valid response accepted", validResponse.accepted === true],
  ["valid response does not send", validResponse.sent === false],
  ["valid response does not book", validResponse.booked === false],
  ["invalid response rejected", invalidResponse.accepted === false],
  ["stub response marked stub", validResponse.stub === true],
  ["contract documents local stub", contract.includes("## Local Stub")],
  ["contract documents stub URL", contract.includes("http://127.0.0.1:5194/reviewed-send")],
  ["contract says stub sent false", contract.includes("always returns `sent: false`")],
  ["app detects stub status", app.includes("function isProductionProviderStubStatus(")],
  ["app detects stub provider", app.includes('String(status.provider || "").toLowerCase() === "stub"')],
  ["app detects stub endpoint", app.includes("127.0.0.1:5194/reviewed-send")],
  ["app explains dry-run mode", app.includes("Stub dry-run mode detected; no real provider sending is enabled.")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production provider stub test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production provider stub test passed.");
