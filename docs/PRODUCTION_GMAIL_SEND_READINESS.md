# Production Gmail Send Readiness Summary

Use this endpoint to aggregate Gmail setup checks before provider implementation review.

```text
POST http://127.0.0.1:5195/gmail/send-readiness
```

Use `tests/fixtures/production-reviewed-send-valid.json` as the first request body, then add unsubscribe or opt-out language while testing the full readiness path.

The response uses `regent-growth.gmail-send-readiness-summary.v1` and must keep:

- `approvedForRealSend: false`
- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Aggregated Checks

The `checks` array includes:

- `reviewed-packet` from `/gmail/preflight`
- `gmail-env` from `/gmail/status`
- `implementation-controls` from `/provider-implementation-guard?provider=gmail`
- `suppression` from `/gmail/suppression-preflight`
- `unsubscribe` from `/gmail/unsubscribe-preflight`
- `audit-preview` from `/gmail/audit-preview/export`

`missingChecks` lists incomplete items. `readyForImplementationReview` can be true only when all checks pass, but that still does not approve Gmail sending.

## Boundary

This summary is a readiness packet for implementation review. Real Gmail sending still requires a separate send-capable adapter change with OAuth handling, provider response mapping, suppression and unsubscribe enforcement, audit coverage, retry handling, and manual setup approval.
