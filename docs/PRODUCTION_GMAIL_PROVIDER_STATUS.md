# Production Gmail Provider Status

Use this endpoint to inspect local Gmail setup before any OAuth or send-capable adapter work.

```text
GET http://127.0.0.1:5195/gmail/status
```

The response uses `regent-growth.gmail-provider-status.v1` and reports whether the Gmail environment is configured.

Required no-send fields:

- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Required Environment

The endpoint checks:

- `REGENT_GMAIL_CLIENT_ID`
- `REGENT_GMAIL_CLIENT_SECRET`
- `REGENT_GMAIL_REFRESH_TOKEN`

Missing values appear in `missingEnv`; configured values appear by name only in `configuredEnv`. Do not log token values or message body content.

## Linked Gates

Use these links from the status response before implementing Gmail send behavior:

- `/provider-implementation-guard?provider=gmail`
- `/provider-decision-record?provider=gmail`

This endpoint does not approve Gmail sending. It only shows whether local Gmail setup evidence is present.
