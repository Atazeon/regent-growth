const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "production-provider-middleware.js"), "utf8");
const projectPlan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");
const { getTestMailboxEnvStatus } = require("../production-provider-middleware");

const originalSender = process.env.REGENT_TEST_MAILBOX_SENDER;
const originalAddress = process.env.REGENT_TEST_MAILBOX_ADDRESS;

delete process.env.REGENT_TEST_MAILBOX_SENDER;
delete process.env.REGENT_TEST_MAILBOX_ADDRESS;
const missingStatus = getTestMailboxEnvStatus();

process.env.REGENT_TEST_MAILBOX_SENDER = "sender@example.com";
process.env.REGENT_TEST_MAILBOX_ADDRESS = "founder@example.com";
const readyStatus = getTestMailboxEnvStatus();

if (originalSender === undefined) {
  delete process.env.REGENT_TEST_MAILBOX_SENDER;
} else {
  process.env.REGENT_TEST_MAILBOX_SENDER = originalSender;
}

if (originalAddress === undefined) {
  delete process.env.REGENT_TEST_MAILBOX_ADDRESS;
} else {
  process.env.REGENT_TEST_MAILBOX_ADDRESS = originalAddress;
}

const checks = [
  ["middleware exports test mailbox env status", typeof getTestMailboxEnvStatus === "function"],
  ["middleware has test mailbox status route", source.includes('requestUrl.pathname === "/test-mailbox/status"')],
  ["status schema exists", readyStatus.schemaVersion === "regent-growth.test-mailbox-status.v1"],
  ["status identifies provider", readyStatus.provider === "test-mailbox"],
  ["status remains no-send", readyStatus.canSend === false && readyStatus.sentEnabled === false],
  ["status remains no-booking", readyStatus.bookedEnabled === false],
  ["status lists required sender", readyStatus.requiredEnv.includes("REGENT_TEST_MAILBOX_SENDER")],
  ["status lists required recipient", readyStatus.requiredEnv.includes("REGENT_TEST_MAILBOX_ADDRESS")],
  ["missing status blocks configured", missingStatus.configured === false],
  ["missing status lists sender", missingStatus.missingEnv.includes("REGENT_TEST_MAILBOX_SENDER")],
  ["missing status lists recipient", missingStatus.missingEnv.includes("REGENT_TEST_MAILBOX_ADDRESS")],
  ["ready status configured", readyStatus.configured === true],
  ["ready status missing env empty", readyStatus.missingEnv.length === 0],
  ["project plan next env status exists", projectPlan.includes("- First test-mailbox provider adapter env status")]
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failures.length) {
  console.error(`Production test-mailbox env status test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production test-mailbox env status test passed.");
