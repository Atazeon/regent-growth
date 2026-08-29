const http = require("http");

const port = Number(process.env.PORT || 5195);
const providerName = process.env.REGENT_EMAIL_PROVIDER || "stub";
const maxBodyBytes = 1024 * 1024;
const maxAuditEntries = 100;
const middlewareAuditTrail = [];
const testMailboxCaptureAuditTrail = [];

const providerAdapters = {
  stub: {
    name: "stub",
    canSend: false,
    requiredEnv: [],
    requiredSetup: ["Use only for local contract validation"]
  },
  gmail: {
    name: "gmail",
    canSend: false,
    requiredEnv: ["REGENT_GMAIL_CLIENT_ID", "REGENT_GMAIL_CLIENT_SECRET", "REGENT_GMAIL_REFRESH_TOKEN"],
    requiredSetup: ["Verified sender mailbox", "OAuth consent approved", "Suppression list configured"]
  },
  outlook: {
    name: "outlook",
    canSend: false,
    requiredEnv: ["REGENT_OUTLOOK_CLIENT_ID", "REGENT_OUTLOOK_CLIENT_SECRET", "REGENT_OUTLOOK_TENANT_ID", "REGENT_OUTLOOK_REFRESH_TOKEN"],
    requiredSetup: ["Verified sender mailbox", "Microsoft Graph mail scope approved", "Suppression list configured"]
  },
  custom: {
    name: "custom",
    canSend: false,
    requiredEnv: ["REGENT_CUSTOM_SEND_URL", "REGENT_CUSTOM_SEND_KEY"],
    requiredSetup: ["Reviewed send endpoint deployed", "Provider-side audit logging enabled", "Suppression list configured"]
  },
  "test-mailbox": {
    name: "test-mailbox",
    canSend: false,
    requiredEnv: ["REGENT_TEST_MAILBOX_SENDER", "REGENT_TEST_MAILBOX_ADDRESS"],
    requiredSetup: ["Dedicated test mailbox configured", "Reviewed packet capture verified", "No real provider send enabled"]
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

function getAdapterGuardrails(adapter = getProviderAdapter()) {
  const missingEnv = adapter.requiredEnv.filter((name) => !process.env[name]);
  return {
    provider: adapter.name,
    canSend: adapter.canSend,
    requiredEnv: adapter.requiredEnv,
    missingEnv,
    requiredSetup: adapter.requiredSetup,
    readyForImplementation: adapter.canSend && missingEnv.length === 0
  };
}

function createProviderSendAdapter(adapter = getProviderAdapter()) {
  if (adapter.name === "test-mailbox") return createTestMailboxSendAdapter(adapter);

  return {
    provider: adapter.name,
    canSend: adapter.canSend,
    async sendReviewedPacket() {
      return {
        accepted: false,
        sent: false,
        booked: false,
        provider: adapter.name,
        providerMessageId: "",
        issues: [`Provider adapter ${adapter.name} is not send-capable yet.`]
      };
    }
  };
}

function createTestMailboxSendAdapter(adapter = getProviderAdapter("test-mailbox")) {
  return {
    provider: adapter.name,
    canSend: false,
    async sendReviewedPacket(payload = {}) {
      const validation = validateMiddlewareRequest(payload);
      const packet = payload.packet || {};
      const expectedSender = process.env.REGENT_TEST_MAILBOX_SENDER || "";
      const expectedRecipient = process.env.REGENT_TEST_MAILBOX_ADDRESS || "";
      const issues = [...validation.issues];

      if (!expectedSender) issues.push("REGENT_TEST_MAILBOX_SENDER is required for test-mailbox capture.");
      if (!expectedRecipient) issues.push("REGENT_TEST_MAILBOX_ADDRESS is required for test-mailbox capture.");
      if (expectedSender && packet.provider?.senderEmail !== expectedSender) {
        issues.push("Sender email must match REGENT_TEST_MAILBOX_SENDER.");
      }
      if (expectedRecipient && packet.message?.to !== expectedRecipient) {
        issues.push("Recipient email must match REGENT_TEST_MAILBOX_ADDRESS.");
      }

      return {
        accepted: issues.length === 0,
        sent: false,
        booked: false,
        captured: issues.length === 0,
        provider: adapter.name,
        providerMessageId: "",
        issues,
        message: issues.length === 0
          ? "Reviewed packet captured for the configured test mailbox. No email was sent."
          : "Reviewed packet was not captured for the test mailbox."
      };
    }
  };
}

function createTestMailboxCaptureAuditEntry(payload = {}, result = {}) {
  const packet = payload.packet || {};
  return {
    id: `test-mailbox-capture-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action: "test-mailbox-capture",
    provider: "test-mailbox",
    accepted: result.accepted === true,
    captured: result.captured === true,
    sent: false,
    booked: false,
    senderEmail: packet.provider?.senderEmail || "",
    recipientEmail: packet.message?.to || "",
    subjectPresent: Boolean(packet.message?.subject),
    bodyStored: false,
    issueCount: Array.isArray(result.issues) ? result.issues.length : 0,
    issues: Array.isArray(result.issues) ? result.issues : [],
    checkedAt: new Date().toISOString()
  };
}

function recordTestMailboxCaptureAuditEntry(payload = {}, result = {}) {
  const entry = createTestMailboxCaptureAuditEntry(payload, result);
  testMailboxCaptureAuditTrail.unshift(entry);
  testMailboxCaptureAuditTrail.splice(maxAuditEntries);
  return entry;
}

function getTestMailboxCaptureAuditTrail() {
  return testMailboxCaptureAuditTrail.slice();
}

function getTestMailboxCaptureAuditExport() {
  const entries = getTestMailboxCaptureAuditTrail();
  return {
    schemaVersion: "regent-growth.test-mailbox-capture-audit.v1",
    generatedAt: new Date().toISOString(),
    maxEntries: maxAuditEntries,
    bodyContentStored: false,
    summary: {
      total: entries.length,
      accepted: entries.filter((entry) => entry.accepted).length,
      captured: entries.filter((entry) => entry.captured).length,
      sent: 0,
      booked: 0,
      issueCount: entries.reduce((total, entry) => total + Number(entry.issueCount || 0), 0)
    },
    entries
  };
}

function getMiddlewareStatus() {
  const adapter = getProviderAdapter();
  const guardrails = getAdapterGuardrails(adapter);
  return {
    ok: true,
    skeleton: true,
    provider: adapter.name,
    canSend: adapter.canSend,
    sentEnabled: false,
    bookedEnabled: false,
    requiredSchema: "regent-growth.reviewed-send.v1",
    guardrails,
    checkedAt: new Date().toISOString()
  };
}

function getAdapterReadinessReport() {
  const adapters = Object.values(providerAdapters).map((adapter) => {
    const guardrails = getAdapterGuardrails(adapter);
    return {
      provider: adapter.name,
      canSend: adapter.canSend,
      readyForImplementation: guardrails.readyForImplementation,
      requiredEnv: guardrails.requiredEnv,
      missingEnv: guardrails.missingEnv,
      requiredSetup: guardrails.requiredSetup,
      blockedReasons: [
        ...(adapter.canSend ? [] : ["Adapter is skeleton-only."]),
        ...guardrails.missingEnv.map((name) => `Missing ${name}.`)
      ]
    };
  });

  return {
    schemaVersion: "regent-growth.adapter-readiness.v1",
    checkedAt: new Date().toISOString(),
    sentEnabled: false,
    bookedEnabled: false,
    adapters,
    readyProviders: adapters.filter((adapter) => adapter.readyForImplementation).map((adapter) => adapter.provider),
    blockedProviders: adapters.filter((adapter) => !adapter.readyForImplementation).map((adapter) => adapter.provider)
  };
}

function getAdapterReadinessExport() {
  return {
    schemaVersion: "regent-growth.adapter-readiness-export.v1",
    generatedAt: new Date().toISOString(),
    checklist: "docs/PRODUCTION_PROVIDER_ADAPTER_CHECKLIST.md",
    machineChecklist: "docs/PRODUCTION_PROVIDER_ADAPTER_CHECKLIST.json",
    readinessDocs: "docs/PRODUCTION_READINESS_REPORT.md",
    report: getAdapterReadinessReport()
  };
}

function getMiddlewareAuditTrail() {
  return middlewareAuditTrail.slice();
}

function getMiddlewareAuditSummary(entries = getMiddlewareAuditTrail()) {
  return entries.reduce((summary, entry) => {
    summary.total += 1;
    if (entry.accepted) summary.accepted += 1;
    if (entry.sent) summary.sent += 1;
    if (entry.booked) summary.booked += 1;
    summary.issueCount += Number(entry.issueCount || 0);
    summary.providers[entry.provider || "unknown"] = (summary.providers[entry.provider || "unknown"] || 0) + 1;
    return summary;
  }, {
    total: 0,
    accepted: 0,
    sent: 0,
    booked: 0,
    issueCount: 0,
    providers: {}
  });
}

function getMiddlewareAuditExport() {
  const entries = getMiddlewareAuditTrail();
  return {
    schemaVersion: "regent-growth.middleware-audit.v1",
    generatedAt: new Date().toISOString(),
    maxEntries: maxAuditEntries,
    bodyContentStored: false,
    summary: getMiddlewareAuditSummary(entries),
    entries
  };
}

function replayMiddlewareFixture(payload = {}) {
  const result = createMiddlewareResponse(payload);
  return {
    replay: true,
    sent: false,
    booked: false,
    recorded: false,
    result,
    auditPreview: createMiddlewareAuditEntry(payload, result, {
      method: "REPLAY",
      path: "/reviewed-send"
    })
  };
}

function getMiddlewareReplayExport(payload = {}) {
  const replay = replayMiddlewareFixture(payload);
  return {
    schemaVersion: "regent-growth.middleware-replay.v1",
    generatedAt: new Date().toISOString(),
    bodyContentStored: false,
    replay
  };
}

function createMiddlewareAuditEntry(payload = {}, result = {}, requestMeta = {}) {
  const packet = payload.packet || {};
  const releaseGate = payload.releaseGate || {};
  const issues = Array.isArray(result.issues) ? result.issues : [];

  return {
    id: `middleware-audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action: "reviewed-send",
    provider: result.provider || packet.provider?.selectedProvider || "stub",
    accepted: result.accepted === true,
    sent: false,
    booked: false,
    skeleton: true,
    issueCount: issues.length,
    issues,
    schemaVersion: packet.schemaVersion || "",
    senderEmail: packet.provider?.senderEmail || "",
    recipientEmail: packet.message?.to || "",
    subjectPresent: Boolean(packet.message?.subject),
    bodyStored: false,
    releaseGateReady: releaseGate.ready === true,
    method: requestMeta.method || "",
    path: requestMeta.path || "",
    checkedAt: result.checkedAt || new Date().toISOString()
  };
}

function recordMiddlewareAuditEntry(payload = {}, result = {}, requestMeta = {}) {
  const entry = createMiddlewareAuditEntry(payload, result, requestMeta);
  middlewareAuditTrail.unshift(entry);
  middlewareAuditTrail.splice(maxAuditEntries);
  return entry;
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
    sendJson(response, 200, getMiddlewareStatus());
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/status") {
    sendJson(response, 200, getMiddlewareStatus());
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/adapter-readiness") {
    sendJson(response, 200, getAdapterReadinessReport());
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/adapter-readiness/export") {
    sendJson(response, 200, getAdapterReadinessExport());
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/audit") {
    sendJson(response, 200, {
      ok: true,
      maxEntries: maxAuditEntries,
      entries: getMiddlewareAuditTrail()
    });
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/audit/export") {
    sendJson(response, 200, getMiddlewareAuditExport());
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/reviewed-send") {
    try {
      const body = await readJsonBody(request);
      const result = createMiddlewareResponse(body);
      const audit = recordMiddlewareAuditEntry(body, result, {
        method: request.method,
        path: requestUrl.pathname
      });
      result.auditId = audit.id;
      sendJson(response, result.accepted ? 200 : 400, result);
    } catch (error) {
      const result = {
        accepted: false,
        sent: false,
        booked: false,
        skeleton: true,
        issues: [error.message]
      };
      const audit = recordMiddlewareAuditEntry({}, result, {
        method: request.method,
        path: requestUrl.pathname
      });
      result.auditId = audit.id;
      sendJson(response, 400, result);
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/replay") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, replayMiddlewareFixture(body));
    } catch (error) {
      sendJson(response, 400, {
        replay: true,
        sent: false,
        booked: false,
        recorded: false,
        issues: [error.message]
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/replay/export") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, getMiddlewareReplayExport(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.middleware-replay.v1",
        generatedAt: new Date().toISOString(),
        bodyContentStored: false,
        replay: {
          replay: true,
          sent: false,
          booked: false,
          recorded: false,
          issues: [error.message]
        }
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/test-mailbox/capture") {
    try {
      const body = await readJsonBody(request);
      const adapter = createTestMailboxSendAdapter();
      const result = await adapter.sendReviewedPacket(body);
      const audit = recordTestMailboxCaptureAuditEntry(body, result);
      result.auditId = audit.id;
      sendJson(response, result.accepted ? 200 : 400, {
        ...result,
        audit
      });
    } catch (error) {
      const result = {
        accepted: false,
        sent: false,
        booked: false,
        captured: false,
        provider: "test-mailbox",
        providerMessageId: "",
        issues: [error.message]
      };
      const audit = recordTestMailboxCaptureAuditEntry({}, result);
      result.auditId = audit.id;
      sendJson(response, 400, {
        ...result,
        audit
      });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/test-mailbox/capture/export") {
    sendJson(response, 200, getTestMailboxCaptureAuditExport());
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
  getAdapterGuardrails,
  createProviderSendAdapter,
  createTestMailboxSendAdapter,
  createTestMailboxCaptureAuditEntry,
  recordTestMailboxCaptureAuditEntry,
  getTestMailboxCaptureAuditTrail,
  getTestMailboxCaptureAuditExport,
  getMiddlewareStatus,
  getAdapterReadinessReport,
  getAdapterReadinessExport,
  getMiddlewareAuditTrail,
  getMiddlewareAuditSummary,
  getMiddlewareAuditExport,
  createMiddlewareAuditEntry,
  recordMiddlewareAuditEntry,
  replayMiddlewareFixture,
  getMiddlewareReplayExport,
  validateMiddlewareRequest,
  createMiddlewareResponse
};
