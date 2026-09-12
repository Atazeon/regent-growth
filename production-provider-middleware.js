const http = require("http");

const port = Number(process.env.PORT || 5195);
const providerName = process.env.REGENT_EMAIL_PROVIDER || "stub";
const maxBodyBytes = 1024 * 1024;
const maxAuditEntries = 100;
const middlewareAuditTrail = [];
const testMailboxCaptureAuditTrail = [];
const gmailAuditPreviewTrail = [];
const outlookAuditPreviewTrail = [];

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
  if (adapter.name === "gmail") return createGmailSendAdapter(adapter);
  if (adapter.name === "outlook") return createOutlookSendAdapter(adapter);

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

function createProviderSkeletonSendAdapter(adapter = getProviderAdapter(), providerLabel = adapter.name) {
  return {
    provider: adapter.name,
    canSend: false,
    async sendReviewedPacket(payload = {}) {
      const validation = validateMiddlewareRequest(payload);
      const guard = getProviderImplementationGuard(adapter.name);
      const issues = [
        `Provider adapter ${adapter.name} is not send-capable yet.`,
        ...validation.issues,
        ...guard.missingControls.map((key) => `${providerLabel} implementation control missing: ${key}.`)
      ];

      if (guard.candidate?.missingEnv?.length) {
        issues.push(...guard.candidate.missingEnv.map((name) => `Missing ${name}.`));
      }

      return {
        accepted: false,
        sent: false,
        booked: false,
        provider: adapter.name,
        providerMessageId: "",
        implementationGuard: guard.schemaVersion,
        missingControls: guard.missingControls,
        issues,
        message: `${providerLabel} adapter skeleton validated the packet path. Real ${providerLabel} sending is not implemented.`
      };
    }
  };
}

function createGmailSendAdapter(adapter = getProviderAdapter("gmail")) {
  return createProviderSkeletonSendAdapter(adapter, "Gmail");
}

function createOutlookSendAdapter(adapter = getProviderAdapter("outlook")) {
  return createProviderSkeletonSendAdapter(adapter, "Outlook");
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

function getTestMailboxEnvStatus() {
  const senderConfigured = Boolean(process.env.REGENT_TEST_MAILBOX_SENDER);
  const recipientConfigured = Boolean(process.env.REGENT_TEST_MAILBOX_ADDRESS);
  return {
    schemaVersion: "regent-growth.test-mailbox-status.v1",
    checkedAt: new Date().toISOString(),
    provider: "test-mailbox",
    configured: senderConfigured && recipientConfigured,
    canSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    requiredEnv: ["REGENT_TEST_MAILBOX_SENDER", "REGENT_TEST_MAILBOX_ADDRESS"],
    missingEnv: [
      ...(senderConfigured ? [] : ["REGENT_TEST_MAILBOX_SENDER"]),
      ...(recipientConfigured ? [] : ["REGENT_TEST_MAILBOX_ADDRESS"])
    ],
    senderConfigured,
    recipientConfigured
  };
}

function getGmailEnvStatus() {
  const adapter = getProviderAdapter("gmail");
  const guardrails = getAdapterGuardrails(adapter);
  const configuredEnv = guardrails.requiredEnv.filter((name) => Boolean(process.env[name]));

  return {
    schemaVersion: "regent-growth.gmail-provider-status.v1",
    checkedAt: new Date().toISOString(),
    provider: "gmail",
    configured: guardrails.missingEnv.length === 0,
    canSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    requiredEnv: guardrails.requiredEnv,
    configuredEnv,
    missingEnv: guardrails.missingEnv,
    requiredSetup: guardrails.requiredSetup,
    implementationGuardEndpoint: "/provider-implementation-guard?provider=gmail",
    decisionRecordEndpoint: "/provider-decision-record?provider=gmail"
  };
}

function getProviderEnvStatus(provider) {
  const adapter = getProviderAdapter(provider);
  const guardrails = getAdapterGuardrails(adapter);
  const configuredEnv = guardrails.requiredEnv.filter((name) => Boolean(process.env[name]));

  return {
    schemaVersion: `regent-growth.${adapter.name}-provider-status.v1`,
    checkedAt: new Date().toISOString(),
    provider: adapter.name,
    configured: guardrails.missingEnv.length === 0,
    canSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    requiredEnv: guardrails.requiredEnv,
    configuredEnv,
    missingEnv: guardrails.missingEnv,
    requiredSetup: guardrails.requiredSetup,
    implementationGuardEndpoint: `/provider-implementation-guard?provider=${adapter.name}`,
    decisionRecordEndpoint: `/provider-decision-record?provider=${adapter.name}`
  };
}

function getOutlookEnvStatus() {
  return getProviderEnvStatus("outlook");
}

function getGmailReviewedPacketPreflight(payload = {}) {
  return getProviderReviewedPacketPreflight("gmail", "Gmail", payload);
}

function getProviderReviewedPacketPreflight(provider, providerLabel, payload = {}) {
  const validation = validateMiddlewareRequest(payload);
  const envStatus = getProviderEnvStatus(provider);
  const implementationGuard = getProviderImplementationGuard(provider);
  const issues = [
    ...validation.issues,
    ...envStatus.missingEnv.map((name) => `Missing ${name}.`),
    ...implementationGuard.missingControls.map((key) => `${providerLabel} implementation control missing: ${key}.`)
  ];

  return {
    schemaVersion: `regent-growth.${provider}-reviewed-packet-preflight.v1`,
    checkedAt: new Date().toISOString(),
    provider,
    accepted: false,
    canSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    reviewedPacketValid: validation.accepted,
    envConfigured: envStatus.configured,
    implementationReady: implementationGuard.missingControls.length === 0,
    envStatusEndpoint: `/${provider}/status`,
    implementationGuardEndpoint: `/provider-implementation-guard?provider=${provider}`,
    issues,
    blockedReasons: [
      `${providerLabel} reviewed-packet preflight is not send approval.`,
      `Real ${providerLabel} sending is not implemented.`,
      ...(issues.length ? [`${providerLabel} preflight issues must be resolved before implementation review.`] : [])
    ]
  };
}

function getOutlookReviewedPacketPreflight(payload = {}) {
  return getProviderReviewedPacketPreflight("outlook", "Outlook", payload);
}

function getProviderAuditPreviewTrail(provider) {
  return provider === "outlook" ? outlookAuditPreviewTrail : gmailAuditPreviewTrail;
}

function createProviderAuditPreviewEntry(provider, providerLabel, payload = {}, preflight = getProviderReviewedPacketPreflight(provider, providerLabel, payload)) {
  const packet = payload.packet || {};
  return {
    id: `${provider}-audit-preview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action: `${provider}-preflight`,
    provider,
    accepted: false,
    sent: false,
    booked: false,
    reviewedPacketValid: preflight.reviewedPacketValid === true,
    envConfigured: preflight.envConfigured === true,
    implementationReady: preflight.implementationReady === true,
    issueCount: Array.isArray(preflight.issues) ? preflight.issues.length : 0,
    issues: Array.isArray(preflight.issues) ? preflight.issues : [],
    senderEmail: packet.provider?.senderEmail || "",
    recipientEmail: packet.message?.to || "",
    subjectPresent: Boolean(packet.message?.subject),
    bodyStored: false,
    checkedAt: preflight.checkedAt || new Date().toISOString()
  };
}

function createGmailAuditPreviewEntry(payload = {}, preflight = getGmailReviewedPacketPreflight(payload)) {
  return createProviderAuditPreviewEntry("gmail", "Gmail", payload, preflight);
}

function createOutlookAuditPreviewEntry(payload = {}, preflight = getOutlookReviewedPacketPreflight(payload)) {
  return createProviderAuditPreviewEntry("outlook", "Outlook", payload, preflight);
}

function recordProviderAuditPreviewEntry(provider, providerLabel, payload = {}, preflight = getProviderReviewedPacketPreflight(provider, providerLabel, payload)) {
  const entry = createProviderAuditPreviewEntry(provider, providerLabel, payload, preflight);
  const trail = getProviderAuditPreviewTrail(provider);
  trail.unshift(entry);
  trail.splice(maxAuditEntries);
  return entry;
}

function recordGmailAuditPreviewEntry(payload = {}, preflight = getGmailReviewedPacketPreflight(payload)) {
  return recordProviderAuditPreviewEntry("gmail", "Gmail", payload, preflight);
}

function recordOutlookAuditPreviewEntry(payload = {}, preflight = getOutlookReviewedPacketPreflight(payload)) {
  return recordProviderAuditPreviewEntry("outlook", "Outlook", payload, preflight);
}

function getProviderAuditPreviewExport(provider) {
  const entries = getProviderAuditPreviewTrail(provider).slice();
  return {
    schemaVersion: `regent-growth.${provider}-audit-preview.v1`,
    generatedAt: new Date().toISOString(),
    maxEntries: maxAuditEntries,
    bodyContentStored: false,
    summary: {
      total: entries.length,
      reviewedPacketValid: entries.filter((entry) => entry.reviewedPacketValid).length,
      envConfigured: entries.filter((entry) => entry.envConfigured).length,
      implementationReady: entries.filter((entry) => entry.implementationReady).length,
      sent: 0,
      booked: 0,
      issueCount: entries.reduce((total, entry) => total + Number(entry.issueCount || 0), 0)
    },
    entries
  };
}

function getGmailAuditPreviewExport() {
  return getProviderAuditPreviewExport("gmail");
}

function getOutlookAuditPreviewExport() {
  return getProviderAuditPreviewExport("outlook");
}

function getProviderRetryPreview(provider, providerLabel, payload = {}) {
  const preflight = getProviderReviewedPacketPreflight(provider, providerLabel, payload);
  const suggestedFixes = preflight.issues.length
    ? preflight.issues.map((issue) => `Resolve before ${providerLabel} retry: ${issue}`)
    : [`Run ${providerLabel} audit preview again after provider implementation review.`];

  return {
    schemaVersion: `regent-growth.${provider}-retry-preview.v1`,
    generatedAt: new Date().toISOString(),
    provider,
    retryAllowed: false,
    canSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    reviewedPacketValid: preflight.reviewedPacketValid,
    envConfigured: preflight.envConfigured,
    implementationReady: preflight.implementationReady,
    suggestedFixes,
    nextEndpoints: [
      `/${provider}/status`,
      `/${provider}/preflight`,
      `/${provider}/audit-preview`,
      `/${provider}/audit-preview/export`
    ],
    blockedReasons: [
      `${providerLabel} retry preview is not send approval.`,
      `Real ${providerLabel} retry behavior is not implemented.`
    ]
  };
}

function getGmailRetryPreview(payload = {}) {
  return getProviderRetryPreview("gmail", "Gmail", payload);
}

function getOutlookRetryPreview(payload = {}) {
  return getProviderRetryPreview("outlook", "Outlook", payload);
}

function mapGmailProviderResponse(responsePayload = {}) {
  const accepted = Boolean(responsePayload.id || responsePayload.messageId);
  const error = responsePayload.error || {};
  const issues = [];

  if (!accepted) {
    issues.push(error.message || "Gmail response did not include a message id.");
  }
  if (error.code) {
    issues.push(`Gmail error code: ${error.code}.`);
  }

  return {
    schemaVersion: "regent-growth.gmail-response-mapping.v1",
    mappedAt: new Date().toISOString(),
    provider: "gmail",
    accepted,
    sent: false,
    booked: false,
    providerMessageId: responsePayload.id || responsePayload.messageId || "",
    threadId: responsePayload.threadId || "",
    retryable: ["rateLimitExceeded", "backendError", "internalError"].includes(error.reason || error.code),
    issueCount: issues.length,
    issues,
    rawResponseStored: false
  };
}

function getGmailResponseMappingPreview(responsePayload = {}) {
  return {
    schemaVersion: "regent-growth.gmail-response-mapping-preview.v1",
    generatedAt: new Date().toISOString(),
    provider: "gmail",
    canSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    mapping: mapGmailProviderResponse(responsePayload),
    blockedReasons: [
      "Gmail response mapping preview is not send approval.",
      "Raw Gmail responses must not be stored in audit exports."
    ]
  };
}

function mapOutlookProviderResponse(responsePayload = {}) {
  const accepted = Boolean(responsePayload.id || responsePayload.internetMessageId);
  const error = responsePayload.error || {};
  const issues = [];

  if (!accepted) {
    issues.push(error.message || "Outlook response did not include a message id.");
  }
  if (error.code) {
    issues.push(`Outlook error code: ${error.code}.`);
  }

  return {
    schemaVersion: "regent-growth.outlook-response-mapping.v1",
    mappedAt: new Date().toISOString(),
    provider: "outlook",
    accepted,
    sent: false,
    booked: false,
    providerMessageId: responsePayload.id || responsePayload.internetMessageId || "",
    conversationId: responsePayload.conversationId || "",
    retryable: ["TooManyRequests", "ServiceUnavailable", "Timeout", "MailboxUnavailable"].includes(error.code),
    issueCount: issues.length,
    issues,
    rawResponseStored: false
  };
}

function getOutlookResponseMappingPreview(responsePayload = {}) {
  return {
    schemaVersion: "regent-growth.outlook-response-mapping-preview.v1",
    generatedAt: new Date().toISOString(),
    provider: "outlook",
    canSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    mapping: mapOutlookProviderResponse(responsePayload),
    blockedReasons: [
      "Outlook response mapping preview is not send approval.",
      "Raw Outlook responses must not be stored in audit exports."
    ]
  };
}

function getSuppressedEmailsForProvider(provider = "gmail") {
  const providerKey = `REGENT_${String(provider).toUpperCase()}_SUPPRESSION_EMAILS`;
  return [
    ...(process.env.REGENT_SUPPRESSION_EMAILS || "").split(","),
    ...(process.env[providerKey] || "").split(",")
  ]
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getProviderSuppressionPreflight(provider, providerLabel, payload = {}) {
  const packet = payload.packet || {};
  const recipientEmail = String(packet.message?.to || "").trim().toLowerCase();
  const suppressedEmails = getSuppressedEmailsForProvider(provider);
  const suppressed = recipientEmail ? suppressedEmails.includes(recipientEmail) : false;
  const issues = [
    ...(!recipientEmail ? [`Recipient email is required for ${providerLabel} suppression preflight.`] : []),
    ...(suppressed ? [`Recipient is on the ${providerLabel} suppression list.`] : [])
  ];

  return {
    schemaVersion: `regent-growth.${provider}-suppression-preflight.v1`,
    checkedAt: new Date().toISOString(),
    provider,
    canSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    recipientEmail,
    suppressionListConfigured: suppressedEmails.length > 0,
    suppressed,
    suppressedEmailCount: suppressedEmails.length,
    issues,
    blockedReasons: [
      `${providerLabel} suppression preflight is not send approval.`,
      ...(suppressed ? ["Suppressed recipients must not be contacted."] : [])
    ]
  };
}

function getGmailSuppressionPreflight(payload = {}) {
  return getProviderSuppressionPreflight("gmail", "Gmail", payload);
}

function getOutlookSuppressionPreflight(payload = {}) {
  return getProviderSuppressionPreflight("outlook", "Outlook", payload);
}

function getProviderUnsubscribePreflight(provider, providerLabel, payload = {}) {
  const packet = payload.packet || {};
  const body = String(packet.message?.body || "");
  const normalizedBody = body.toLowerCase();
  const requiredTerms = ["unsubscribe", "opt out"];
  const hasUnsubscribeLanguage = requiredTerms.some((term) => normalizedBody.includes(term));
  const issues = [
    ...(!body ? [`Message body is required for ${providerLabel} unsubscribe preflight.`] : []),
    ...(!hasUnsubscribeLanguage ? ["Message body must include unsubscribe or opt-out language."] : [])
  ];

  return {
    schemaVersion: `regent-growth.${provider}-unsubscribe-preflight.v1`,
    checkedAt: new Date().toISOString(),
    provider,
    canSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    bodyContentStored: false,
    hasUnsubscribeLanguage,
    requiredTerms,
    issues,
    blockedReasons: [
      `${providerLabel} unsubscribe preflight is not send approval.`,
      ...(!hasUnsubscribeLanguage ? [`Unsubscribe or opt-out language is required before ${providerLabel} implementation review.`] : [])
    ]
  };
}

function getGmailUnsubscribePreflight(payload = {}) {
  return getProviderUnsubscribePreflight("gmail", "Gmail", payload);
}

function getOutlookUnsubscribePreflight(payload = {}) {
  return getProviderUnsubscribePreflight("outlook", "Outlook", payload);
}

function getGmailSendReadinessSummary(payload = {}) {
  const reviewedPacketPreflight = getGmailReviewedPacketPreflight(payload);
  const envStatus = getGmailEnvStatus();
  const implementationGuard = getProviderImplementationGuard("gmail");
  const suppressionPreflight = getGmailSuppressionPreflight(payload);
  const unsubscribePreflight = getGmailUnsubscribePreflight(payload);
  const auditPreviewExport = getGmailAuditPreviewExport();
  const checks = [
    {
      key: "reviewed-packet",
      ready: reviewedPacketPreflight.reviewedPacketValid === true,
      endpoint: "/gmail/preflight"
    },
    {
      key: "gmail-env",
      ready: envStatus.configured === true,
      endpoint: "/gmail/status"
    },
    {
      key: "implementation-controls",
      ready: implementationGuard.missingControls.length === 0,
      endpoint: "/provider-implementation-guard?provider=gmail"
    },
    {
      key: "suppression",
      ready: suppressionPreflight.suppressed === false && suppressionPreflight.issues.length === 0,
      endpoint: "/gmail/suppression-preflight"
    },
    {
      key: "unsubscribe",
      ready: unsubscribePreflight.hasUnsubscribeLanguage === true,
      endpoint: "/gmail/unsubscribe-preflight"
    },
    {
      key: "audit-preview",
      ready: auditPreviewExport.entries.length > 0 && auditPreviewExport.bodyContentStored === false,
      endpoint: "/gmail/audit-preview/export"
    }
  ];
  const missingChecks = checks.filter((check) => !check.ready).map((check) => check.key);

  return {
    schemaVersion: "regent-growth.gmail-send-readiness-summary.v1",
    generatedAt: new Date().toISOString(),
    provider: "gmail",
    readyForImplementationReview: missingChecks.length === 0,
    approvedForRealSend: false,
    canSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    checks,
    missingChecks,
    blockedReasons: [
      "Gmail send readiness summary is not send approval.",
      ...(missingChecks.length ? ["Gmail readiness checks are incomplete."] : []),
      "Real Gmail sending requires a separate implementation approval."
    ]
  };
}

function createBlockedGmailSendResult(payload = {}) {
  const readiness = getGmailSendReadinessSummary(payload);
  return {
    schemaVersion: "regent-growth.gmail-send-blocked.v1",
    checkedAt: new Date().toISOString(),
    provider: "gmail",
    accepted: false,
    sent: false,
    booked: false,
    providerMessageId: "",
    readyForImplementationReview: readiness.readyForImplementationReview,
    readinessSummary: readiness.schemaVersion,
    missingChecks: readiness.missingChecks,
    issues: [
      "Gmail live-send endpoint is blocked.",
      "Real Gmail sending is not implemented.",
      ...readiness.missingChecks.map((check) => `Gmail readiness check missing: ${check}.`)
    ],
    blockedReasons: [
      "Gmail live-send blocked endpoint is not send approval.",
      "Implement OAuth send, suppression enforcement, unsubscribe enforcement, audit logging, retry handling, and manual setup approval before enabling Gmail sends."
    ]
  };
}

function getGmailProviderRunPacket() {
  return {
    schemaVersion: "regent-growth.gmail-provider-run-packet.v1",
    generatedAt: new Date().toISOString(),
    provider: "gmail",
    mode: "blocked-send-prep",
    approvedForRealSend: false,
    canSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    fixture: "tests/fixtures/production-reviewed-send-valid.json",
    endpoints: {
      status: "/gmail/status",
      preflight: "/gmail/preflight",
      auditPreview: "/gmail/audit-preview",
      auditPreviewExport: "/gmail/audit-preview/export",
      retryPreview: "/gmail/retry-preview",
      responseMappingPreview: "/gmail/response-mapping-preview",
      suppressionPreflight: "/gmail/suppression-preflight",
      unsubscribePreflight: "/gmail/unsubscribe-preflight",
      sendReadiness: "/gmail/send-readiness",
      blockedSend: "/gmail/send"
    },
    requiredProof: [
      "Gmail environment status export reviewed.",
      "Reviewed packet preflight passes validation.",
      "Suppression preflight confirms recipient is not suppressed.",
      "Unsubscribe preflight confirms opt-out language.",
      "Audit preview export confirms bodyContentStored is false.",
      "Response mapping preview covers success and retryable errors.",
      "Blocked send endpoint returns 403 with sent false."
    ]
  };
}

function getGmailImplementationReviewExport(payload = {}) {
  return {
    schemaVersion: "regent-growth.gmail-implementation-review-export.v1",
    generatedAt: new Date().toISOString(),
    provider: "gmail",
    approvedForRealSend: false,
    canSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    runPacket: getGmailProviderRunPacket(),
    decisionRecord: getRealProviderDecisionRecord("gmail"),
    implementationGuard: getProviderImplementationGuard("gmail"),
    readinessSummary: getGmailSendReadinessSummary(payload),
    requiredDocs: [
      "docs/PRODUCTION_GMAIL_PROVIDER_STATUS.md",
      "docs/PRODUCTION_GMAIL_PREFLIGHT.md",
      "docs/PRODUCTION_GMAIL_AUDIT_PREVIEW.md",
      "docs/PRODUCTION_GMAIL_RETRY_PREVIEW.md",
      "docs/PRODUCTION_GMAIL_RESPONSE_MAPPING.md",
      "docs/PRODUCTION_GMAIL_SUPPRESSION_PREFLIGHT.md",
      "docs/PRODUCTION_GMAIL_UNSUBSCRIBE_PREFLIGHT.md",
      "docs/PRODUCTION_GMAIL_SEND_READINESS.md",
      "docs/PRODUCTION_GMAIL_BLOCKED_SEND.md",
      "docs/PRODUCTION_GMAIL_RUN_PACKET.md"
    ],
    blockedReasons: [
      "Gmail implementation review export is not send approval.",
      "Gmail canSend must remain false until a separate implementation approval."
    ]
  };
}

function getTestMailboxRunPacket() {
  return {
    schemaVersion: "regent-growth.test-mailbox-run-packet.v1",
    generatedAt: new Date().toISOString(),
    provider: "test-mailbox",
    mode: "capture-only",
    sentEnabled: false,
    bookedEnabled: false,
    statusEndpoint: "/test-mailbox/status",
    captureEndpoint: "/test-mailbox/capture",
    captureExportEndpoint: "/test-mailbox/capture/export",
    replayFixture: "tests/fixtures/production-test-mailbox-reviewed-send.json",
    mismatchFixture: "tests/fixtures/production-test-mailbox-mismatch-reviewed-send.json",
    status: getTestMailboxEnvStatus(),
    requiredSteps: [
      "Set REGENT_EMAIL_PROVIDER to test-mailbox.",
      "Set REGENT_TEST_MAILBOX_SENDER to the reviewed sender.",
      "Set REGENT_TEST_MAILBOX_ADDRESS to the test recipient.",
      "Run the matching replay fixture.",
      "Run the mismatch fixture and confirm rejection.",
      "Export the capture audit and confirm bodyContentStored is false."
    ]
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

function getRealProviderPreflightGate() {
  const readinessExport = getAdapterReadinessExport();
  const testMailboxStatus = getTestMailboxEnvStatus();
  const testMailboxRunPacket = getTestMailboxRunPacket();
  const testMailboxCaptureExport = getTestMailboxCaptureAuditExport();
  const hasAcceptedCapture = testMailboxCaptureExport.summary.accepted > 0;
  const hasRejectedCapture = testMailboxCaptureExport.entries.some((entry) => entry.accepted === false && entry.issueCount > 0);
  const evidence = [
    {
      key: "provider-adapter-checklist",
      label: "Provider adapter checklist export",
      ready: readinessExport.machineChecklist === "docs/PRODUCTION_PROVIDER_ADAPTER_CHECKLIST.json",
      source: readinessExport.machineChecklist
    },
    {
      key: "adapter-readiness-export",
      label: "Adapter readiness export",
      ready: readinessExport.report.sentEnabled === false && readinessExport.report.blockedProviders.includes("gmail"),
      endpoint: "/adapter-readiness/export"
    },
    {
      key: "test-mailbox-status",
      label: "Test-mailbox sender and recipient configured",
      ready: testMailboxStatus.configured === true,
      endpoint: "/test-mailbox/status",
      missing: testMailboxStatus.missingEnv
    },
    {
      key: "test-mailbox-run-packet",
      label: "Test-mailbox run packet export",
      ready: testMailboxRunPacket.sentEnabled === false && testMailboxRunPacket.bookedEnabled === false,
      endpoint: "/test-mailbox/run-packet"
    },
    {
      key: "test-mailbox-accepted-capture",
      label: "Matching test-mailbox capture recorded",
      ready: hasAcceptedCapture,
      endpoint: "/test-mailbox/capture/export"
    },
    {
      key: "test-mailbox-rejected-capture",
      label: "Mismatch test-mailbox capture rejected",
      ready: hasRejectedCapture,
      endpoint: "/test-mailbox/capture/export"
    },
    {
      key: "body-content-not-stored",
      label: "Capture audit export does not store message bodies",
      ready: testMailboxCaptureExport.bodyContentStored === false,
      endpoint: "/test-mailbox/capture/export"
    },
    {
      key: "setup-review",
      label: "Final provider setup review documented",
      ready: true,
      source: "docs/PRODUCTION_PROVIDER_SETUP_REVIEW.md"
    }
  ];
  const missingEvidence = evidence.filter((item) => !item.ready).map((item) => item.key);

  return {
    schemaVersion: "regent-growth.real-provider-preflight.v1",
    checkedAt: new Date().toISOString(),
    approvedForRealSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    providerCandidates: ["gmail", "outlook", "custom"],
    readinessExportEndpoint: "/adapter-readiness/export",
    testMailboxRunPacketEndpoint: "/test-mailbox/run-packet",
    testMailboxCaptureExportEndpoint: "/test-mailbox/capture/export",
    evidence,
    missingEvidence,
    blockedReasons: [
      "Real provider adapters remain skeleton-only.",
      ...(missingEvidence.length ? ["Required test-mailbox evidence is incomplete."] : []),
      "Manual provider setup review is still required before enabling canSend."
    ]
  };
}

function getRealProviderSelectionPlan() {
  const preflight = getRealProviderPreflightGate();
  const candidates = ["gmail", "outlook", "custom"].map((provider) => {
    const adapter = getProviderAdapter(provider);
    const guardrails = getAdapterGuardrails(adapter);
    const configuredEnvCount = guardrails.requiredEnv.length - guardrails.missingEnv.length;
    const setupCount = guardrails.requiredSetup.length;
    const readinessScore = configuredEnvCount + (preflight.missingEvidence.length === 0 ? setupCount : 0);

    return {
      provider,
      canSend: false,
      configuredEnvCount,
      requiredEnvCount: guardrails.requiredEnv.length,
      missingEnv: guardrails.missingEnv,
      requiredSetup: guardrails.requiredSetup,
      readinessScore,
      blockedReasons: [
        "Adapter send implementation is not enabled.",
        ...guardrails.missingEnv.map((name) => `Missing ${name}.`),
        ...(preflight.missingEvidence.length ? ["Preflight evidence is incomplete."] : [])
      ]
    };
  });
  const rankedCandidates = candidates.slice().sort((a, b) => {
    if (b.readinessScore !== a.readinessScore) return b.readinessScore - a.readinessScore;
    return a.provider.localeCompare(b.provider);
  });

  return {
    schemaVersion: "regent-growth.real-provider-selection-plan.v1",
    generatedAt: new Date().toISOString(),
    approvedForRealSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    recommendation: rankedCandidates[0]?.provider || "gmail",
    recommendationReason: "Pick the provider with the most configured environment evidence, then complete provider-specific implementation behind the preflight gate.",
    preflightEndpoint: "/provider-preflight",
    candidates: rankedCandidates,
    requiredDecisionInputs: [
      "Primary sending mailbox owner",
      "Provider account type and domain",
      "OAuth or API key creation path",
      "Suppression-list source",
      "Unsubscribe or opt-out text",
      "Daily send limit"
    ]
  };
}

function getRealProviderDecisionRecord(selectedProvider = process.env.REGENT_SELECTED_EMAIL_PROVIDER || "") {
  const selectionPlan = getRealProviderSelectionPlan();
  const normalizedProvider = String(selectedProvider || selectionPlan.recommendation || "").toLowerCase();
  const selectedCandidate = selectionPlan.candidates.find((candidate) => candidate.provider === normalizedProvider) || null;
  const provider = selectedCandidate?.provider || selectionPlan.recommendation;

  return {
    schemaVersion: "regent-growth.real-provider-decision-record.v1",
    generatedAt: new Date().toISOString(),
    provider,
    requestedProvider: normalizedProvider,
    validProvider: Boolean(selectedCandidate),
    approvedForRealSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    selectionPlanEndpoint: "/provider-selection-plan",
    preflightEndpoint: "/provider-preflight",
    candidate: selectedCandidate || selectionPlan.candidates.find((candidate) => candidate.provider === provider) || null,
    requiredDecisionInputs: selectionPlan.requiredDecisionInputs,
    requiredImplementationBeforeSend: [
      "Provider-specific send adapter",
      "Suppression-list enforcement",
      "Unsubscribe or opt-out enforcement",
      "Provider audit logging",
      "Provider retry and failure handling",
      "Manual setup review approval"
    ],
    blockedReasons: [
      "Decision record is not send approval.",
      "Provider implementation remains disabled.",
      ...(!selectedCandidate ? ["Requested provider is not one of gmail, outlook, or custom."] : [])
    ]
  };
}

function getProviderImplementationGuard(selectedProvider = process.env.REGENT_SELECTED_EMAIL_PROVIDER || "") {
  const decisionRecord = getRealProviderDecisionRecord(selectedProvider);
  const provider = decisionRecord.provider;
  const evidenceEnvPrefix = `REGENT_${provider.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  const controls = [
    {
      key: "send-adapter",
      label: "Provider-specific send adapter implemented",
      evidenceEnv: `${evidenceEnvPrefix}_SEND_ADAPTER_REVIEWED`
    },
    {
      key: "suppression-enforcement",
      label: "Suppression-list enforcement implemented",
      evidenceEnv: `${evidenceEnvPrefix}_SUPPRESSION_REVIEWED`
    },
    {
      key: "unsubscribe-enforcement",
      label: "Unsubscribe or opt-out enforcement implemented",
      evidenceEnv: `${evidenceEnvPrefix}_UNSUBSCRIBE_REVIEWED`
    },
    {
      key: "audit-logging",
      label: "Provider audit logging implemented",
      evidenceEnv: `${evidenceEnvPrefix}_AUDIT_REVIEWED`
    },
    {
      key: "retry-failure-handling",
      label: "Provider retry and failure handling implemented",
      evidenceEnv: `${evidenceEnvPrefix}_RETRY_REVIEWED`
    },
    {
      key: "manual-setup-review",
      label: "Manual setup review approved",
      evidenceEnv: `${evidenceEnvPrefix}_SETUP_APPROVED`
    }
  ].map((control) => ({
    ...control,
    ready: process.env[control.evidenceEnv] === "true"
  }));
  const missingControls = controls.filter((control) => !control.ready).map((control) => control.key);

  return {
    schemaVersion: "regent-growth.provider-implementation-guard.v1",
    checkedAt: new Date().toISOString(),
    provider,
    validProvider: decisionRecord.validProvider,
    approvedForRealSend: false,
    canEnableSend: false,
    sentEnabled: false,
    bookedEnabled: false,
    decisionRecordEndpoint: "/provider-decision-record",
    controls,
    missingControls,
    blockedReasons: [
      "Implementation guard is not send approval.",
      ...(!decisionRecord.validProvider ? ["Selected provider is invalid."] : []),
      ...(missingControls.length ? ["Required implementation controls are incomplete."] : []),
      "Set canSend only in a provider-specific implementation change with tests."
    ]
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

  if (request.method === "GET" && requestUrl.pathname === "/provider-preflight") {
    sendJson(response, 200, getRealProviderPreflightGate());
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/provider-selection-plan") {
    sendJson(response, 200, getRealProviderSelectionPlan());
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/provider-decision-record") {
    sendJson(response, 200, getRealProviderDecisionRecord(requestUrl.searchParams.get("provider")));
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/provider-implementation-guard") {
    sendJson(response, 200, getProviderImplementationGuard(requestUrl.searchParams.get("provider")));
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/gmail/status") {
    sendJson(response, 200, getGmailEnvStatus());
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/outlook/status") {
    sendJson(response, 200, getOutlookEnvStatus());
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/gmail/preflight") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, getGmailReviewedPacketPreflight(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.gmail-reviewed-packet-preflight.v1",
        checkedAt: new Date().toISOString(),
        provider: "gmail",
        accepted: false,
        canSend: false,
        sentEnabled: false,
        bookedEnabled: false,
        issues: [error.message],
        blockedReasons: ["Gmail reviewed-packet preflight requires valid JSON."]
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/outlook/preflight") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, getOutlookReviewedPacketPreflight(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.outlook-reviewed-packet-preflight.v1",
        checkedAt: new Date().toISOString(),
        provider: "outlook",
        accepted: false,
        canSend: false,
        sentEnabled: false,
        bookedEnabled: false,
        issues: [error.message],
        blockedReasons: ["Outlook reviewed-packet preflight requires valid JSON."]
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/gmail/audit-preview") {
    try {
      const body = await readJsonBody(request);
      const preflight = getGmailReviewedPacketPreflight(body);
      const auditPreview = recordGmailAuditPreviewEntry(body, preflight);
      sendJson(response, 200, {
        schemaVersion: "regent-growth.gmail-audit-preview-result.v1",
        recorded: true,
        sent: false,
        booked: false,
        preflight,
        auditPreview
      });
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.gmail-audit-preview-result.v1",
        recorded: false,
        sent: false,
        booked: false,
        issues: [error.message]
      });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/gmail/audit-preview/export") {
    sendJson(response, 200, getGmailAuditPreviewExport());
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/outlook/audit-preview") {
    try {
      const body = await readJsonBody(request);
      const preflight = getOutlookReviewedPacketPreflight(body);
      const auditPreview = recordOutlookAuditPreviewEntry(body, preflight);
      sendJson(response, 200, {
        schemaVersion: "regent-growth.outlook-audit-preview-result.v1",
        recorded: true,
        sent: false,
        booked: false,
        preflight,
        auditPreview
      });
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.outlook-audit-preview-result.v1",
        recorded: false,
        sent: false,
        booked: false,
        issues: [error.message]
      });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/outlook/audit-preview/export") {
    sendJson(response, 200, getOutlookAuditPreviewExport());
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/gmail/retry-preview") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, getGmailRetryPreview(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.gmail-retry-preview.v1",
        generatedAt: new Date().toISOString(),
        provider: "gmail",
        retryAllowed: false,
        canSend: false,
        sentEnabled: false,
        bookedEnabled: false,
        suggestedFixes: [`Submit valid JSON before Gmail retry preview: ${error.message}`],
        blockedReasons: ["Gmail retry preview requires valid JSON."]
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/outlook/retry-preview") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, getOutlookRetryPreview(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.outlook-retry-preview.v1",
        generatedAt: new Date().toISOString(),
        provider: "outlook",
        retryAllowed: false,
        canSend: false,
        sentEnabled: false,
        bookedEnabled: false,
        suggestedFixes: [`Submit valid JSON before Outlook retry preview: ${error.message}`],
        blockedReasons: ["Outlook retry preview requires valid JSON."]
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/gmail/response-mapping-preview") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, getGmailResponseMappingPreview(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.gmail-response-mapping-preview.v1",
        generatedAt: new Date().toISOString(),
        provider: "gmail",
        canSend: false,
        sentEnabled: false,
        bookedEnabled: false,
        issues: [error.message]
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/outlook/response-mapping-preview") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, getOutlookResponseMappingPreview(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.outlook-response-mapping-preview.v1",
        generatedAt: new Date().toISOString(),
        provider: "outlook",
        canSend: false,
        sentEnabled: false,
        bookedEnabled: false,
        issues: [error.message]
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/gmail/suppression-preflight") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, getGmailSuppressionPreflight(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.gmail-suppression-preflight.v1",
        checkedAt: new Date().toISOString(),
        provider: "gmail",
        canSend: false,
        sentEnabled: false,
        bookedEnabled: false,
        issues: [error.message]
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/outlook/suppression-preflight") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, getOutlookSuppressionPreflight(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.outlook-suppression-preflight.v1",
        checkedAt: new Date().toISOString(),
        provider: "outlook",
        canSend: false,
        sentEnabled: false,
        bookedEnabled: false,
        issues: [error.message]
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/gmail/unsubscribe-preflight") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, getGmailUnsubscribePreflight(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.gmail-unsubscribe-preflight.v1",
        checkedAt: new Date().toISOString(),
        provider: "gmail",
        canSend: false,
        sentEnabled: false,
        bookedEnabled: false,
        bodyContentStored: false,
        issues: [error.message]
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/outlook/unsubscribe-preflight") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, getOutlookUnsubscribePreflight(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.outlook-unsubscribe-preflight.v1",
        checkedAt: new Date().toISOString(),
        provider: "outlook",
        canSend: false,
        sentEnabled: false,
        bookedEnabled: false,
        bodyContentStored: false,
        issues: [error.message]
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/gmail/send-readiness") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, getGmailSendReadinessSummary(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.gmail-send-readiness-summary.v1",
        generatedAt: new Date().toISOString(),
        provider: "gmail",
        approvedForRealSend: false,
        canSend: false,
        sentEnabled: false,
        bookedEnabled: false,
        issues: [error.message]
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/gmail/send") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 403, createBlockedGmailSendResult(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.gmail-send-blocked.v1",
        checkedAt: new Date().toISOString(),
        provider: "gmail",
        accepted: false,
        sent: false,
        booked: false,
        providerMessageId: "",
        issues: [error.message],
        blockedReasons: ["Gmail live-send endpoint requires valid JSON."]
      });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/gmail/run-packet") {
    sendJson(response, 200, getGmailProviderRunPacket());
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/gmail/implementation-review/export") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, getGmailImplementationReviewExport(body));
    } catch (error) {
      sendJson(response, 400, {
        schemaVersion: "regent-growth.gmail-implementation-review-export.v1",
        generatedAt: new Date().toISOString(),
        provider: "gmail",
        approvedForRealSend: false,
        canSend: false,
        sentEnabled: false,
        bookedEnabled: false,
        issues: [error.message]
      });
    }
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

  if (request.method === "GET" && requestUrl.pathname === "/test-mailbox/status") {
    sendJson(response, 200, getTestMailboxEnvStatus());
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/test-mailbox/run-packet") {
    sendJson(response, 200, getTestMailboxRunPacket());
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
  createProviderSkeletonSendAdapter,
  createGmailSendAdapter,
  createOutlookSendAdapter,
  createTestMailboxSendAdapter,
  createTestMailboxCaptureAuditEntry,
  recordTestMailboxCaptureAuditEntry,
  getTestMailboxCaptureAuditTrail,
  getTestMailboxCaptureAuditExport,
  getTestMailboxEnvStatus,
  getProviderEnvStatus,
  getGmailEnvStatus,
  getOutlookEnvStatus,
  getProviderReviewedPacketPreflight,
  getGmailReviewedPacketPreflight,
  getOutlookReviewedPacketPreflight,
  getProviderAuditPreviewTrail,
  createProviderAuditPreviewEntry,
  createGmailAuditPreviewEntry,
  createOutlookAuditPreviewEntry,
  recordProviderAuditPreviewEntry,
  recordGmailAuditPreviewEntry,
  recordOutlookAuditPreviewEntry,
  getProviderAuditPreviewExport,
  getGmailAuditPreviewExport,
  getOutlookAuditPreviewExport,
  getProviderRetryPreview,
  getGmailRetryPreview,
  getOutlookRetryPreview,
  mapGmailProviderResponse,
  getGmailResponseMappingPreview,
  mapOutlookProviderResponse,
  getOutlookResponseMappingPreview,
  getSuppressedEmailsForProvider,
  getProviderSuppressionPreflight,
  getGmailSuppressionPreflight,
  getOutlookSuppressionPreflight,
  getProviderUnsubscribePreflight,
  getGmailUnsubscribePreflight,
  getOutlookUnsubscribePreflight,
  getGmailSendReadinessSummary,
  createBlockedGmailSendResult,
  getGmailProviderRunPacket,
  getGmailImplementationReviewExport,
  getTestMailboxRunPacket,
  getMiddlewareStatus,
  getAdapterReadinessReport,
  getAdapterReadinessExport,
  getRealProviderPreflightGate,
  getRealProviderSelectionPlan,
  getRealProviderDecisionRecord,
  getProviderImplementationGuard,
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
