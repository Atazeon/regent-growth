const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const planDoc = fs.readFileSync(path.join(root, "docs", "PRODUCTION_MIDDLEWARE_PLAN.md"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const valid = require("./fixtures/production-reviewed-send-valid.json");
const invalid = require("./fixtures/production-reviewed-send-invalid-automation.json");
const { getProviderAdapter, validateMiddlewareRequest, createMiddlewareResponse } = require("../production-provider-middleware");

const validValidation = validateMiddlewareRequest(valid);
const invalidValidation = validateMiddlewareRequest(invalid);
const validResponse = createMiddlewareResponse(valid);
const invalidResponse = createMiddlewareResponse(invalid);

const checks = [
  ["middleware file creates server", source.includes("http.createServer")],
  ["middleware has provider adapters", source.includes("const providerAdapters = {")],
  ["middleware adapters cannot send", source.includes("canSend: false")],
  ["middleware exports adapter getter", typeof getProviderAdapter === "function"],
  ["middleware exports validator", typeof validateMiddlewareRequest === "function"],
  ["middleware exports response helper", typeof createMiddlewareResponse === "function"],
  ["gmail adapter exists", getProviderAdapter("gmail").name === "gmail"],
  ["gmail adapter cannot send", getProviderAdapter("gmail").canSend === false],
  ["valid fixture validates", validValidation.accepted === true],
  ["invalid fixture rejected", invalidValidation.accepted === false],
  ["valid skeleton response not accepted for send", validResponse.accepted === false],
  ["valid skeleton response does not send", validResponse.sent === false],
  ["valid skeleton response is skeleton", validResponse.skeleton === true],
  ["valid skeleton response explains cannot send", validResponse.issues.some((issue) => issue.includes("cannot send yet"))],
  ["invalid skeleton response rejected", invalidResponse.accepted === false],
  ["middleware has reviewed send route", source.includes('requestUrl.pathname === "/reviewed-send"')],
  ["middleware has health route", source.includes('requestUrl.pathname === "/health"')],
  ["plan doc mentions skeleton file", planDoc.includes("production-provider-middleware.js")],
  ["project plan next skeleton exists", projectPlan.includes("- Production middleware skeleton")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production middleware skeleton test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production middleware skeleton test passed.");
