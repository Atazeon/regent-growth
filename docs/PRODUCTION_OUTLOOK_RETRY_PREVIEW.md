# Production Outlook Retry Preview

Use this endpoint to inspect what would need to be fixed before retrying an Outlook preflight path.

```text
POST http://127.0.0.1:5195/outlook/retry-preview
```

Use `tests/fixtures/production-reviewed-send-valid.json` as the first request body.

The response uses `regent-growth.outlook-retry-preview.v1` and must keep:

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

`suggestedFixes` is built from the Outlook preflight issues. Use it to decide whether to revisit `/outlook/status`, `/outlook/preflight`, `/outlook/audit-preview`, or `/outlook/audit-preview/export`.

## Boundary

This endpoint does not retry an Outlook send. Real retry behavior requires the Outlook provider implementation to map Microsoft Graph responses, classify retryable failures, preserve audit metadata, enforce suppression and unsubscribe controls, and pass manual setup approval.
