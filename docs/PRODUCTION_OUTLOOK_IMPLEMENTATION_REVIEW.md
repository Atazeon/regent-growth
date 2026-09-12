# Production Outlook Implementation Review Export

Use this endpoint to bundle the local Outlook provider evidence before starting a send-capable implementation task.

```text
POST http://127.0.0.1:5195/outlook/implementation-review/export
```

Use `tests/fixtures/production-reviewed-send-valid.json` as the first request body, with compliant unsubscribe or opt-out language when testing the complete readiness path.

The response uses `regent-growth.outlook-implementation-review-export.v1` and must keep:

- `approvedForRealSend: false`
- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Bundled Evidence

The export includes:

- `runPacket`
- `decisionRecord`
- `implementationGuard`
- `readinessSummary`
- `requiredDocs`
- `blockedReasons`

The required docs list should include Outlook status, preflight, audit preview, retry preview, response mapping, suppression, unsubscribe, send readiness, blocked send, and run packet docs.

## Boundary

This export is not Outlook send approval. It is the final local review packet before a separate implementation task adds Microsoft Graph OAuth sending, provider response handling, suppression and unsubscribe enforcement, retry behavior, audit coverage, and manual setup approval.
