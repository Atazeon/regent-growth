# Real-Provider Rollout Gap List

Use this endpoint to list the remaining Gmail and Outlook gaps before any real provider can send.

```text
GET http://127.0.0.1:5195/real-provider/rollout-gap-list
```

The response uses `regent-growth.real-provider-rollout-gap-list.v1` and must keep:

- `approvedForRealSend: false`
- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Provider Gaps

The `providers` array includes:

- `gmail`
- `outlook`

Each provider links its implementation review export and the combined production readiness review:

- `/gmail/implementation-review/export`
- `/outlook/implementation-review/export`
- `/real-provider/production-readiness-review`

Each provider gap list should include:

- OAuth send adapter implementation
- suppression enforcement inside the send path
- unsubscribe enforcement inside the send path
- provider response handling for success and retryable failures
- bounded retry behavior with audit coverage
- audit logging that avoids storing message body content
- manual setup approval before `canSend` changes

This list is not send approval. Every provider gap must be closed in a separate reviewed implementation before live sending.
