# Production Gmail Retry Preview

Use this endpoint to inspect what would need to be fixed before retrying a Gmail preflight path.

```text
POST http://127.0.0.1:5195/gmail/retry-preview
```

Use `tests/fixtures/production-reviewed-send-valid.json` as the first request body.

The response uses `regent-growth.gmail-retry-preview.v1` and must keep:

- `retryAllowed: false`
- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Retry Review Fields

The retry preview reports:

- `reviewedPacketValid`
- `envConfigured`
- `implementationReady`
- `suggestedFixes`
- `nextEndpoints`
- `blockedReasons`

`suggestedFixes` is built from the Gmail preflight issues. Use it to decide whether to revisit `/gmail/status`, `/gmail/preflight`, `/gmail/audit-preview`, or `/gmail/audit-preview/export`.

## Boundary

This endpoint does not retry a Gmail send. Real retry behavior requires the Gmail provider implementation to map provider responses, classify retryable failures, preserve audit metadata, enforce suppression and unsubscribe controls, and pass manual setup approval.
