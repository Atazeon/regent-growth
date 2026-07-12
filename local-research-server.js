const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = process.cwd();
const port = Number(process.env.PORT || 5193);
const sharedProspectsPath = path.join(root, "data", "shared-prospects.json");
const sharedBackupsDir = path.join(root, "data", "backups");
const maxBodyBytes = 1024 * 1024;
const maxTeamHistoryItems = 25;
const configuredTeamBackupLimit = Number(process.env.REGENT_TEAM_BACKUP_LIMIT || 12);
const maxSharedProspectsBackups = Number.isFinite(configuredTeamBackupLimit)
  ? Math.max(1, Math.floor(configuredTeamBackupLimit))
  : 12;
const sourceTimeoutMs = 12000;
const searchTimeoutMs = 12000;
const searchApiUrl = process.env.REGENT_SEARCH_API_URL || "";
const searchApiKey = process.env.REGENT_SEARCH_API_KEY || "";
const searchApiKeyHeader = process.env.REGENT_SEARCH_API_KEY_HEADER || "Authorization";
const crmApiUrl = process.env.REGENT_CRM_API_URL || "";
const crmApiKey = process.env.REGENT_CRM_API_KEY || "";
const crmApiKeyHeader = process.env.REGENT_CRM_API_KEY_HEADER || "Authorization";
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8"
};

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readSharedProspects() {
  try {
    const raw = fs.readFileSync(sharedProspectsPath, "utf8");
    const payload = JSON.parse(raw);

    return {
      updatedAt: payload.updatedAt || "",
      source: payload.source || "team-sync",
      records: Array.isArray(payload.records) ? payload.records : [],
      history: Array.isArray(payload.history) ? payload.history.slice(0, maxTeamHistoryItems) : []
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        updatedAt: "",
        source: "team-sync",
        records: [],
        history: []
      };
    }

    throw error;
  }
}

function countValues(records, fieldName, fallback = "Unassigned") {
  return records.reduce((counts, record) => {
    const value = cleanText(record?.[fieldName]) || fallback;
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function calculateSharedProspectsBackupChecksum(payload) {
  const checksumPayload = {
    records: Array.isArray(payload.records) ? payload.records : [],
    history: Array.isArray(payload.history) ? payload.history : [],
    updatedAt: payload.updatedAt || "",
    createdAt: payload.createdAt || ""
  };

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(checksumPayload))
    .digest("hex");
}

function validateSharedProspectsBackupPayload(payload) {
  const issues = [];
  const warnings = [];

  if (!payload || typeof payload !== "object") {
    return {
      status: "invalid",
      issues: ["Backup file must contain a JSON object."],
      warnings,
      checksum: "",
      checkedAt: new Date().toISOString()
    };
  }

  if (!Array.isArray(payload.records)) {
    issues.push("Backup file must contain a records array.");
  } else {
    const invalidRecords = payload.records.filter((record) => !record || typeof record !== "object").length;
    const unnamedRecords = payload.records.filter((record) => !cleanText(record?.company)).length;

    if (invalidRecords > 0) {
      issues.push(`${invalidRecords} record${invalidRecords === 1 ? "" : "s"} are not valid objects.`);
    }

    if (unnamedRecords > 0) {
      warnings.push(`${unnamedRecords} record${unnamedRecords === 1 ? "" : "s"} have no company name.`);
    }
  }

  if (payload.history !== undefined && !Array.isArray(payload.history)) {
    warnings.push("History is not an array and will be ignored during restore.");
  }

  const checksum = calculateSharedProspectsBackupChecksum(payload);
  if (payload.integrity?.checksum && payload.integrity.checksum !== checksum) {
    issues.push("Backup checksum does not match the current file contents.");
  }

  return {
    status: issues.length > 0 ? "invalid" : warnings.length > 0 ? "warning" : "valid",
    issues,
    warnings,
    checksum,
    checkedAt: new Date().toISOString()
  };
}

function createSharedProspectsBackupAudit(records, history, reason, createdAt, activity = {}) {
  const latestActivity = Array.isArray(history) && history.length > 0 ? history[0] : null;

  return {
    reason: cleanText(reason) || "Automatic safety backup",
    triggerType: cleanText(activity.type) || "manual",
    createdBy: cleanText(activity.actor) || "Local user",
    createdAt,
    sourceUpdatedAt: "",
    recordCount: records.length,
    historyCount: Array.isArray(history) ? history.length : 0,
    latestActivity: latestActivity ? {
      actor: cleanText(latestActivity.actor) || "Local user",
      summary: cleanText(latestActivity.summary) || "Shared store updated.",
      createdAt: latestActivity.createdAt || ""
    } : null,
    stageCounts: countValues(records, "stage", "Research"),
    responseCounts: countValues(records, "responseStatus", "Not Contacted"),
    ownerCounts: countValues(records, "handoffOwner", "Unassigned"),
    blockedCount: records.filter((record) => record?.handoffStatus === "Blocked").length,
    meetingCount: records.filter((record) => record?.stage === "Meeting" || record?.responseStatus === "Meeting Booked").length
  };
}

function createSharedProspectsBackup(reason = "manual", activity = {}) {
  const current = readSharedProspects();
  const createdAt = new Date().toISOString();
  const label = cleanText(activity.label) || cleanText(reason) || "Automatic safety backup";
  const safeReason = cleanText(reason).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "backup";
  const filename = `shared-prospects-${createdAt.slice(0, 19).replace(/[:T]/g, "-")}-${safeReason}.json`;
  const filePath = path.join(sharedBackupsDir, filename);
  const audit = {
    ...createSharedProspectsBackupAudit(current.records, current.history, reason, createdAt, activity),
    sourceUpdatedAt: current.updatedAt || ""
  };
  const payload = {
    source: "regent-growth-auto-backup",
    reason,
    label,
    createdAt,
    audit,
    ...current
  };
  payload.integrity = validateSharedProspectsBackupPayload(payload);

  fs.mkdirSync(sharedBackupsDir, { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);

  const retention = pruneSharedProspectsBackups();

  return {
    filename,
    path: filePath,
    label,
    createdAt,
    recordCount: current.records.length,
    historyCount: current.history.length,
    audit,
    integrity: payload.integrity,
    retention
  };
}

function readSharedProspectsBackupSummaries() {
  try {
    return fs.readdirSync(sharedBackupsDir)
      .filter((filename) => filename.endsWith(".json"))
      .map((filename) => {
        const filePath = path.join(sharedBackupsDir, filename);
        const stats = fs.statSync(filePath);
        let recordCount = 0;
        let historyCount = 0;
        let reason = "";
        let label = "";
        let createdAt = stats.mtime.toISOString();
        let audit = null;
        let integrity = {
          status: "invalid",
          issues: ["Backup metadata could not be read."],
          warnings: [],
          checksum: "",
          checkedAt: new Date().toISOString()
        };

        try {
          const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
          recordCount = Array.isArray(payload.records) ? payload.records.length : 0;
          historyCount = Array.isArray(payload.history) ? payload.history.length : 0;
          reason = payload.reason || "";
          label = payload.label || "";
          createdAt = payload.createdAt || createdAt;
          audit = payload.audit && typeof payload.audit === "object" ? payload.audit : null;
          integrity = validateSharedProspectsBackupPayload(payload);
        } catch {
          reason = "Unreadable backup metadata";
        }

        return {
          filename,
          createdAt,
          reason,
          label,
          recordCount,
          historyCount,
          audit,
          integrity,
          sizeBytes: stats.size
        };
      })
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt) || second.filename.localeCompare(first.filename));
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

function listSharedProspectsBackups() {
  return readSharedProspectsBackupSummaries().slice(0, 20);
}

function pruneSharedProspectsBackups() {
  const backups = readSharedProspectsBackupSummaries();
  const deleted = [];

  backups.slice(maxSharedProspectsBackups).forEach((backup) => {
    try {
      fs.unlinkSync(path.join(sharedBackupsDir, backup.filename));
      deleted.push(backup.filename);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  });

  return {
    limit: maxSharedProspectsBackups,
    keptCount: Math.min(backups.length, maxSharedProspectsBackups),
    deletedCount: deleted.length,
    deleted
  };
}

function getSharedProspectsBackup(filename) {
  const safeFilename = path.basename(String(filename || ""));

  if (!safeFilename || safeFilename !== filename || !safeFilename.endsWith(".json")) {
    throw new Error("A valid backup filename is required.");
  }

  const filePath = path.join(sharedBackupsDir, safeFilename);
  const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const integrity = validateSharedProspectsBackupPayload(payload);

  return {
    filename: safeFilename,
    ...payload,
    integrity,
    records: Array.isArray(payload.records) ? payload.records : [],
    history: Array.isArray(payload.history) ? payload.history : []
  };
}

function labelSharedProspectsBackup(filename, label) {
  const safeFilename = path.basename(String(filename || ""));

  if (!safeFilename || safeFilename !== filename || !safeFilename.endsWith(".json")) {
    throw new Error("A valid backup filename is required.");
  }

  const cleanLabel = cleanText(label).slice(0, 80);
  const filePath = path.join(sharedBackupsDir, safeFilename);
  const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
  payload.label = cleanLabel;
  payload.labelUpdatedAt = new Date().toISOString();
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);

  return getSharedProspectsBackup(safeFilename);
}

function deleteSharedProspectsBackup(filename) {
  const safeFilename = path.basename(String(filename || ""));

  if (!safeFilename || safeFilename !== filename || !safeFilename.endsWith(".json")) {
    throw new Error("A valid backup filename is required.");
  }

  const filePath = path.join(sharedBackupsDir, safeFilename);
  fs.unlinkSync(filePath);

  return {
    filename: safeFilename,
    deleted: true
  };
}

function deleteSharedProspectsBackups(filenames = []) {
  if (!Array.isArray(filenames) || filenames.length === 0) {
    throw new Error("At least one backup filename is required.");
  }

  const deleted = [];
  const missing = [];

  filenames.forEach((filename) => {
    try {
      deleted.push(deleteSharedProspectsBackup(filename).filename);
    } catch (error) {
      if (error.code === "ENOENT") {
        missing.push(filename);
        return;
      }

      throw error;
    }
  });

  return {
    deletedCount: deleted.length,
    missingCount: missing.length,
    deleted,
    missing
  };
}

function writeSharedProspects(records, activity = {}, restoredHistory = null) {
  const current = readSharedProspects();
  const isRestore = activity.type === "restore";
  const backup = isRestore ? createSharedProspectsBackup(activity.summary || "restore", activity) : null;
  const existingHistory = Array.isArray(restoredHistory)
    ? restoredHistory.slice(0, maxTeamHistoryItems)
    : current.history;
  const updatedAt = new Date().toISOString();
  const historyEntry = {
    id: `${updatedAt}-${Math.random().toString(16).slice(2)}`,
    type: activity.type || "push",
    actor: cleanText(activity.actor) || "Local user",
    summary: cleanText(activity.summary) || `Updated ${records.length} shared prospect${records.length === 1 ? "" : "s"}.`,
    recordCount: records.length,
    stats: activity.stats && typeof activity.stats === "object" ? activity.stats : {},
    createdAt: updatedAt
  };
  const payload = {
    source: "team-sync",
    updatedAt,
    records,
    history: [historyEntry, ...existingHistory].slice(0, maxTeamHistoryItems)
  };

  fs.mkdirSync(path.dirname(sharedProspectsPath), { recursive: true });
  fs.writeFileSync(sharedProspectsPath, `${JSON.stringify(payload, null, 2)}\n`);
  return backup ? { ...payload, backup } : payload;
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

function cleanText(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function getCrmStatus() {
  let endpoint = "";

  if (crmApiUrl) {
    try {
      endpoint = new URL(crmApiUrl).origin;
    } catch {
      endpoint = "Invalid CRM URL";
    }
  }

  return {
    configured: Boolean(crmApiUrl),
    endpoint,
    keyConfigured: Boolean(crmApiKey),
    keyHeader: crmApiKeyHeader
  };
}

function extractFirst(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return cleanText(match[1]);
    }
  }

  return "";
}

function extractEvidence(html) {
  const title = extractFirst(html, [/<title[^>]*>([\s\S]*?)<\/title>/i]);
  const description = extractFirst(html, [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i
  ]);
  const text = cleanText(html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " "));

  return {
    title,
    description,
    snippet: text.slice(0, 700)
  };
}

function getSourceUrl(value) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https source URLs are supported.");
  }

  return url;
}

function getConfiguredSearchUrl(query, count) {
  if (!searchApiUrl) {
    throw new Error("Search API is not configured. Set REGENT_SEARCH_API_URL and optional REGENT_SEARCH_API_KEY before starting the server.");
  }

  const url = new URL(searchApiUrl);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("REGENT_SEARCH_API_URL must use http or https.");
  }

  if (!url.searchParams.has("q") && !url.searchParams.has("query")) {
    url.searchParams.set("q", query);
  }

  if (!url.searchParams.has("count") && !url.searchParams.has("limit") && !url.searchParams.has("num")) {
    url.searchParams.set("count", String(count));
  }

  return url;
}

function getSearchStatus() {
  let providerHost = "";
  let configured = false;

  try {
    if (searchApiUrl) {
      const url = new URL(searchApiUrl);
      providerHost = url.hostname;
      configured = ["http:", "https:"].includes(url.protocol);
    }
  } catch {
    configured = false;
  }

  return {
    configured,
    providerHost,
    hasApiKey: Boolean(searchApiKey),
    keyHeader: searchApiKeyHeader,
    endpointEnv: "REGENT_SEARCH_API_URL",
    keyEnv: "REGENT_SEARCH_API_KEY",
    keyHeaderEnv: "REGENT_SEARCH_API_KEY_HEADER"
  };
}

function getByPath(value, pathValue) {
  return pathValue.split(".").reduce((current, key) => current?.[key], value);
}

function firstArrayFromPayload(payload) {
  const paths = [
    "results",
    "items",
    "webPages.value",
    "organic",
    "organic_results",
    "data",
    "response.results"
  ];

  for (const pathValue of paths) {
    const value = getByPath(payload, pathValue);
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function normalizeSearchResult(item) {
  const url = item.url || item.link || item.href || item.displayUrl || item.displayed_link || "";
  const title = item.title || item.name || item.heading || "";
  const snippet = item.snippet || item.description || item.summary || item.text || "";

  return {
    title: cleanText(title),
    url: cleanText(url),
    snippet: cleanText(snippet)
  };
}

async function searchSources(query, count = 5) {
  const url = getConfiguredSearchUrl(query, count);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), searchTimeoutMs);
  const headers = {
    "Accept": "application/json"
  };

  if (searchApiKey) {
    headers[searchApiKeyHeader] = searchApiKeyHeader.toLowerCase() === "authorization"
      ? `Bearer ${searchApiKey}`
      : searchApiKey;
  }

  try {
    const response = await fetch(url, { headers, signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Search API returned ${response.status}`);
    }

    const payload = await response.json();
    const results = firstArrayFromPayload(payload)
      .map(normalizeSearchResult)
      .filter((result) => result.url || result.title)
      .slice(0, count);

    return {
      query,
      fetchedAt: new Date().toISOString(),
      results
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSourceEvidence(sourceUrl) {
  const url = getSourceUrl(sourceUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), sourceTimeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "RegentGrowthLocalResearch/1.0",
        "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8"
      }
    });

    if (!response.ok) {
      throw new Error(`Website returned ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const body = await response.text();
    const evidence = extractEvidence(body);

    return {
      url: url.href,
      finalUrl: response.url,
      contentType,
      fetchedAt: new Date().toISOString(),
      ...evidence
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function syncCrmRecords(records) {
  if (!crmApiUrl) {
    throw new Error("CRM API is not configured. Set REGENT_CRM_API_URL and optional REGENT_CRM_API_KEY before starting the server.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), sourceTimeoutMs);
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json"
  };

  if (crmApiKey) {
    headers[crmApiKeyHeader] = crmApiKeyHeader.toLowerCase() === "authorization"
      ? `Bearer ${crmApiKey}`
      : crmApiKey;
  }

  try {
    const response = await fetch(crmApiUrl, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        source: "regent-growth",
        syncedAt: new Date().toISOString(),
        records
      })
    });
    const contentType = response.headers.get("content-type") || "";
    const responseBody = await response.text();
    const payload = contentType.includes("application/json") && responseBody
      ? JSON.parse(responseBody)
      : { message: responseBody };

    if (!response.ok) {
      throw new Error(payload.message || `CRM API returned ${response.status}`);
    }

    return {
      ok: true,
      status: response.status,
      syncedAt: new Date().toISOString(),
      result: payload
    };
  } finally {
    clearTimeout(timeout);
  }
}

function serveStatic(request, response) {
  const requestUrl = new URL(request.url, `http://127.0.0.1:${port}`);
  const pathname = requestUrl.pathname === "/" ? "/index.html" : decodeURIComponent(requestUrl.pathname);
  const filePath = path.normalize(path.join(root, pathname));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(data);
  });
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://127.0.0.1:${port}`);

  if (request.method === "GET" && requestUrl.pathname === "/api/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/search-status") {
    sendJson(response, 200, getSearchStatus());
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/crm-status") {
    sendJson(response, 200, getCrmStatus());
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/team-prospects") {
    try {
      sendJson(response, 200, readSharedProspects());
    } catch (error) {
      sendJson(response, 500, { message: error.message });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/team-backups") {
    try {
      sendJson(response, 200, {
        backups: listSharedProspectsBackups(),
        retentionLimit: maxSharedProspectsBackups
      });
    } catch (error) {
      sendJson(response, 500, { message: error.message });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/team-backup") {
    try {
      const filename = requestUrl.searchParams.get("filename") || "";
      sendJson(response, 200, getSharedProspectsBackup(filename));
    } catch (error) {
      sendJson(response, 404, { message: error.code === "ENOENT" ? "Backup file was not found." : error.message });
    }
    return;
  }

  if (request.method === "PATCH" && requestUrl.pathname === "/api/team-backup") {
    try {
      const body = await readJsonBody(request);
      const filename = requestUrl.searchParams.get("filename") || body.filename || "";
      sendJson(response, 200, labelSharedProspectsBackup(filename, body.label || ""));
    } catch (error) {
      sendJson(response, 400, { message: error.code === "ENOENT" ? "Backup file was not found." : error.message });
    }
    return;
  }

  if (request.method === "DELETE" && requestUrl.pathname === "/api/team-backups") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, deleteSharedProspectsBackups(body.filenames || []));
    } catch (error) {
      sendJson(response, 400, { message: error.message });
    }
    return;
  }

  if (request.method === "DELETE" && requestUrl.pathname === "/api/team-backup") {
    try {
      const filename = requestUrl.searchParams.get("filename") || "";
      sendJson(response, 200, deleteSharedProspectsBackup(filename));
    } catch (error) {
      sendJson(response, 404, { message: error.code === "ENOENT" ? "Backup file was not found." : error.message });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/fetch-source") {
    try {
      const body = await readJsonBody(request);
      const evidence = await fetchSourceEvidence(body.url);
      sendJson(response, 200, evidence);
    } catch (error) {
      sendJson(response, 400, { message: error.name === "AbortError" ? "Source fetch timed out." : error.message });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/search-sources") {
    try {
      const body = await readJsonBody(request);
      const query = cleanText(body.query);
      const count = Math.min(10, Math.max(1, Number(body.count) || 5));

      if (!query) {
        throw new Error("Search query is required.");
      }

      const results = await searchSources(query, count);
      sendJson(response, 200, results);
    } catch (error) {
      sendJson(response, 400, { message: error.name === "AbortError" ? "Search API timed out." : error.message });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/crm-sync") {
    try {
      const body = await readJsonBody(request);
      const records = Array.isArray(body.records) ? body.records : [];

      if (records.length === 0) {
        throw new Error("At least one CRM record is required.");
      }

      const result = await syncCrmRecords(records);
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 400, { message: error.name === "AbortError" ? "CRM API timed out." : error.message });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/team-prospects") {
    try {
      const body = await readJsonBody(request);
      const records = Array.isArray(body.records) ? body.records : [];
      const restoredHistory = Array.isArray(body.history) ? body.history : null;
      const payload = writeSharedProspects(records, body.activity || {}, restoredHistory);
      sendJson(response, 200, payload);
    } catch (error) {
      sendJson(response, 400, { message: error.message });
    }
    return;
  }

  if (request.method === "GET") {
    serveStatic(request, response);
    return;
  }

  response.writeHead(405);
  response.end("Method not allowed");
});

if (require.main === module) {
  server.listen(port, "127.0.0.1", () => {
    console.log(`Regent Growth local research server: http://127.0.0.1:${port}/index.html`);
  });
}

module.exports = {
  firstArrayFromPayload,
  createSharedProspectsBackup,
  deleteSharedProspectsBackup,
  deleteSharedProspectsBackups,
  getCrmStatus,
  getSearchStatus,
  getSharedProspectsBackup,
  labelSharedProspectsBackup,
  listSharedProspectsBackups,
  normalizeSearchResult,
  pruneSharedProspectsBackups,
  readSharedProspects,
  syncCrmRecords,
  validateSharedProspectsBackupPayload,
  writeSharedProspects
};
