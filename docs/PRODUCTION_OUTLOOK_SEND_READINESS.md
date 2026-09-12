# Production Outlook Send Readiness Summary

Use this endpoint to aggregate Outlook setup checks before provider implementation review.

```text
POST http://127.0.0.1:5195/outlook/send-readiness
```

Use `tests/fixtures/production-reviewed-send-valid.json` as the first request body, then add unsubscribe or opt-out language while testing the full readiness path.

The response uses `regent-growth.outlook-send-readiness-summary.v1` and must keep:

- `approvedForRealSend: false`
- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Aggregated Checks

The `checks` array includes:

- `reviewed-packet` from `/outlook/preflight`
- `outlook-env` from `/outlook/status`
- `implementation-controls` from `/provider-implementation-guard?provider=outlook`
- `suppression` from `/outlook/suppression-preflight`
- `unsubscribe` from `/outlook/unsubscribe-preflight`
- `audit-preview` from `/outlook/audit-preview/export`

`missingChecks` lists incomplete items. `readyForImplementationReview` can be true only when all checks pass, but that still does not approve Outlook sending.

## Boundary

This summary is a readiness packet for implementation review. Real Outlook sending still requires a separate send-capable adapter change with Microsoft Graph OAuth handling, provider response mapping, suppression and unsubscribe enforcement, audit coverage, retry handling, and manual setup approval.
