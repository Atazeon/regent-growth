const http = require("http");

const port = Number(process.env.PORT || 5195);
const providerName = process.env.REGENT_EMAIL_PROVIDER || "stub";
const maxBodyBytes = 1024 * 1024;

const providerAdapters = {
  stub: {
    name: "stub",
    canSend: false
  },
  gmail: {
    name: "gmail",
    canSend: false
  },
  outlook: {
    name: "outlook",
    canSend: false
  },
  custom: {
    name: "custom",
    canSend: false
  }
};

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

function getProviderAdapter(name = providerName) {
  return providerAdapters[String(name || "").toLowerCase()] || providerAdapters.stub;
}

function validateMiddlewareRequest(payload = {}) {
  const packet = payload.packet || {};
  const releaseGate = payload.releaseGate || {};
  const issues = [];

  if (packet.schemaVersion !== "regent-growth.reviewed-send.v1") issues.push("Unsupported reviewed send packet schema.");
  if (packet.automationAllowed !== false) issues.push("automationAllowed must be false.");
  if (packet.safety?.humanReviewRequired !== true) issues.push("Human review is required.");
  if (packet.safety?.automaticSendDisabled !== true) issues.push("Automatic send must remain disabled in this skeleton.");
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

function createMiddlewareResponse(payload = {}) {
  const adapter = getProviderAdapter(payload.packet?.provider?.selectedProvider);
  const validation = validateMiddlewareRequest(payload);
  const issues = [...validation.issues];

  if (validation.accepted && !adapter.canSend) {
    issues.push(`Provider adapter ${adapter.name} is skeleton-only and cannot send yet.`);
  }

  return {
    accepted: validation.accepted && adapter.canSend,
    sent: false,
    booked: false,
    skeleton: true,
    provider: adapter.name,
    providerMessageId: "",
    checkedAt: new Date().toISOString(),
    issues,
    message: "Production middleware skeleton validated the request. Real provider sending is not implemented."
  };
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://127.0.0.1:${port}`);

  if (request.method === "GET" && requestUrl.pathname === "/health") {
    sendJson(response, 200, {
      ok: true,
      skeleton: true,
      provider: getProviderAdapter().name,
      canSend: getProviderAdapter().canSend
    });
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/reviewed-send") {
    try {
      const body = await readJsonBody(request);
      const result = createMiddlewareResponse(body);
      sendJson(response, result.accepted ? 200 : 400, result);
    } catch (error) {
      sendJson(response, 400, {
        accepted: false,
        sent: false,
        booked: false,
        skeleton: true,
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
    console.log(`Regent Growth production provider middleware skeleton: http://127.0.0.1:${port}/health`);
  });
}

module.exports = {
  getProviderAdapter,
  validateMiddlewareRequest,
  createMiddlewareResponse
};
