const http = require("http");

const port = Number(process.env.PORT || 5194);
const maxBodyBytes = 1024 * 1024;

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxBodyBytes) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });

    request.on("error", reject);
  });
}

function validateReviewedSendRequest(payload = {}) {
  const packet = payload.packet || {};
  const releaseGate = payload.releaseGate || {};
  const issues = [];

  if (packet.schemaVersion !== "regent-growth.reviewed-send.v1") issues.push("Unsupported reviewed send packet schema.");
  if (packet.automationAllowed !== false) issues.push("automationAllowed must be false.");
  if (packet.safety?.humanReviewRequired !== true) issues.push("Human review is required.");
  if (packet.safety?.automaticSendDisabled !== true) issues.push("Automatic send must remain disabled for the stub.");
  if (packet.safety?.complianceReviewRequired !== true) issues.push("Compliance review is required.");
  if (!packet.provider?.senderEmail) issues.push("Sender email is required.");
  if (!packet.message?.to) issues.push("Recipient email is required.");
  if (!packet.message?.subject) issues.push("Subject is required.");
  if (!packet.message?.body) issues.push("Body is required.");
  if (releaseGate.ready !== true) issues.push("Release gate evidence is required.");

  return {
    accepted: issues.length === 0,
    issues
  };
}

function createStubReviewedSendResponse(payload = {}) {
  const validation = validateReviewedSendRequest(payload);
  const packet = payload.packet || {};
  return {
    accepted: validation.accepted,
    sent: false,
    booked: false,
    stub: true,
    provider: packet.provider?.selectedProvider || "",
    providerMessageId: "",
    checkedAt: new Date().toISOString(),
    issues: validation.issues,
    message: validation.accepted
      ? "Reviewed send request accepted by local stub. No email was sent."
      : "Reviewed send request rejected by local stub."
  };
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://127.0.0.1:${port}`);

  if (request.method === "GET" && requestUrl.pathname === "/health") {
    sendJson(response, 200, { ok: true, stub: true });
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/reviewed-send") {
    try {
      const body = await readJsonBody(request);
      const result = createStubReviewedSendResponse(body);
      sendJson(response, result.accepted ? 200 : 400, result);
    } catch (error) {
      sendJson(response, 400, {
        accepted: false,
        sent: false,
        booked: false,
        stub: true,
        issues: [error.message]
      });
    }
    return;
  }

  response.writeHead(404);
  response.end("Not found");
});

if (require.main === module) {
  server.listen(port, "127.0.0.1", () => {
    console.log(`Regent Growth production provider stub: http://127.0.0.1:${port}/health`);
  });
}

module.exports = {
  validateReviewedSendRequest,
  createStubReviewedSendResponse
};
