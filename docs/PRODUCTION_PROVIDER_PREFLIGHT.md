# Production Provider Preflight

Use this endpoint before moving from the local test-mailbox adapter toward Gmail, Outlook, or a custom provider adapter.

Start the middleware, then open:

```text
GET http://127.0.0.1:5195/provider-preflight
```

The response uses `regent-growth.real-provider-preflight.v1` and is read-only. It must keep:

- `approvedForRealSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Required Evidence

Confirm the `evidence` array includes these keys:

- `provider-adapter-checklist`
- `adapter-readiness-export`
- `test-mailbox-status`
- `test-mailbox-run-packet`
- `test-mailbox-accepted-capture`
- `test-mailbox-rejected-capture`
- `body-content-not-stored`
- `setup-review`

Run the test-mailbox matching fixture and mismatch fixture before treating this export as complete. The preflight gate should report missing evidence until `/test-mailbox/capture/export` includes both an accepted capture and a rejected mismatch capture.

## Blockers

The preflight gate is not permission to send real email. Real provider adapters remain skeleton-only, and `canSend` must stay false until provider-specific implementation, suppression handling, unsubscribe handling, audit logging, and manual setup review are complete.
