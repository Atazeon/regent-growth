const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const plan = fs.readFileSync(path.join(root, "PROJECT_PLAN.md"), "utf8");

const checks = [
  ["integration readiness region exists", html.includes('id="productionIntegrationReadiness"')],
  ["integration packet copy button exists", html.includes('id="copyProductionIntegrationPacketButton"')],
  ["integration packet download button exists", html.includes('id="downloadProductionIntegrationPacketButton"')],
  ["integration readiness selector exists", app.includes('const productionIntegrationReadiness = document.querySelector("#productionIntegrationReadiness")')],
  ["integration copy selector exists", app.includes('const copyProductionIntegrationPacketButton = document.querySelector("#copyProductionIntegrationPacketButton")')],
  ["integration helper exists", app.includes("function getProductionIntegrationReadiness(")],
  ["integration render exists", app.includes("function renderProductionIntegrationReadiness(")],
  ["integration packet formatter exists", app.includes("function formatProductionIntegrationPacket(")],
  ["integration title exists", app.includes("Production Email And Calendar Integration Readiness")],
  ["integration checks calendar link", app.includes("Calendar booking link")],
  ["integration no automation rule exists", app.includes("do not automate production sending or calendar booking")],
  ["integration copy handler exists", app.includes("async function copyProductionIntegrationPacket()")],
  ["integration download handler exists", app.includes("function downloadProductionIntegrationPacket()")],
  ["integration filename exists", app.includes("regent-growth-production-integration-readiness-")],
  ["integration render called", app.includes("renderProductionIntegrationReadiness(prospect);")],
  ["integration copy bound", app.includes('copyProductionIntegrationPacketButton.addEventListener("click", copyProductionIntegrationPacket)')],
  ["integration download bound", app.includes('downloadProductionIntegrationPacketButton.addEventListener("click", downloadProductionIntegrationPacket)')],
  ["README mentions production integration readiness", readme.includes("production integration readiness")],
  ["plan next integration provider setup", plan.includes("- Production integration provider setup")]
];

const failures = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (failures.length) {
  console.error(`Production integration readiness test failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Production integration readiness test passed.");
