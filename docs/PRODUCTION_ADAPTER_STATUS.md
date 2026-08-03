# Production Adapter Status

Provider adapters exist only as guarded skeleton entries. None can send yet.

## Stub

- Purpose: local contract validation.
- Required environment: none.
- Can send: no.

## Gmail

- Purpose: future Gmail API adapter.
- Required environment: `REGENT_GMAIL_CLIENT_ID`, `REGENT_GMAIL_CLIENT_SECRET`, `REGENT_GMAIL_REFRESH_TOKEN`.
- Required setup: verified sender mailbox, approved OAuth consent, suppression list.
- Can send: no.

## Outlook

- Purpose: future Microsoft Graph mail adapter.
- Required environment: `REGENT_OUTLOOK_CLIENT_ID`, `REGENT_OUTLOOK_CLIENT_SECRET`, `REGENT_OUTLOOK_TENANT_ID`, `REGENT_OUTLOOK_REFRESH_TOKEN`.
- Required setup: verified sender mailbox, approved Graph mail scope, suppression list.
- Can send: no.

## Custom

- Purpose: future custom reviewed-send endpoint.
- Required environment: `REGENT_CUSTOM_SEND_URL`, `REGENT_CUSTOM_SEND_KEY`.
- Required setup: deployed reviewed-send endpoint, provider-side audit logging, suppression list.
- Can send: no.

## Status Endpoint

Run `production-provider-middleware.js` and inspect:

```text
http://127.0.0.1:5195/status
```

The response includes `guardrails`, `missingEnv`, `sentEnabled: false`, and `bookedEnabled: false`.
