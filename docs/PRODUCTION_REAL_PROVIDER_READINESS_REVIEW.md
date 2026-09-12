# Real-Provider Production Readiness Review

Use this endpoint to compare the Gmail and Outlook implementation review packets before any send-capable provider work starts.

```text
POST http://127.0.0.1:5195/real-provider/production-readiness-review
```

Use `tests/fixtures/production-reviewed-send-valid.json` as the first request body, with compliant unsubscribe or opt-out language when testing the complete readiness path.

The response uses `regent-growth.real-provider-production-readiness-review.v1` and must keep:

- `approvedForRealSend: false`
- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Provider Evidence

The `providers` array includes both:

- `gmail`
- `outlook`

Each provider entry includes:

- `implementationReviewSchema`
- `runPacketSchema`
- `readinessSummarySchema`
- `requiredDocCount`
- `readyForImplementationReview`
- `missingChecks`
- `approvedForRealSend: false`
- `canSend: false`

## Review Endpoints

The review links the provider exports:

- `/gmail/implementation-review/export`
- `/outlook/implementation-review/export`

It also lists:

- `docs/PRODUCTION_GMAIL_IMPLEMENTATION_REVIEW.md`
- `docs/PRODUCTION_OUTLOOK_IMPLEMENTATION_REVIEW.md`

This review is not send approval. Gmail and Outlook remain blocked until a separate send-capable implementation is approved.
