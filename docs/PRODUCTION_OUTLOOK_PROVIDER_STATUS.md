# Production Outlook Provider Status

Use this endpoint to inspect local Outlook / Microsoft Graph setup before any send-capable adapter work.

```text
GET http://127.0.0.1:5195/outlook/status
```

The response uses `regent-growth.outlook-provider-status.v1` and reports whether the Outlook environment is configured.

Required no-send fields:

- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Required Environment

The endpoint checks:

- `REGENT_OUTLOOK_CLIENT_ID`
- `REGENT_OUTLOOK_CLIENT_SECRET`
- `REGENT_OUTLOOK_TENANT_ID`
- `REGENT_OUTLOOK_REFRESH_TOKEN`

Missing values appear in `missingEnv`; configured values appear by name only in `configuredEnv`. Do not log token values or message body content.

## Linked Gates

Use these links from the status response before implementing Outlook send behavior:

- `/provider-implementation-guard?provider=outlook`
- `/provider-decision-record?provider=outlook`

This endpoint does not approve Outlook sending. It only shows whether local Microsoft Graph setup evidence is present.
