# Production Provider Implementation Guard

Use this endpoint before changing a selected provider adapter from skeleton-only toward send-capable implementation.

```text
GET http://127.0.0.1:5195/provider-implementation-guard?provider=gmail
```

Supported provider values are `gmail`, `outlook`, and `custom`. The response uses `regent-growth.provider-implementation-guard.v1`.

Required no-send fields:

- `approvedForRealSend: false`
- `canEnableSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Evidence Flags

For Gmail, the guard checks these local evidence flags:

- `REGENT_GMAIL_SEND_ADAPTER_REVIEWED`
- `REGENT_GMAIL_SUPPRESSION_REVIEWED`
- `REGENT_GMAIL_UNSUBSCRIBE_REVIEWED`
- `REGENT_GMAIL_AUDIT_REVIEWED`
- `REGENT_GMAIL_RETRY_REVIEWED`
- `REGENT_GMAIL_SETUP_APPROVED`

Set a flag to `true` only after the related implementation has tests and a manual setup review. Outlook and custom providers use the same suffixes with `REGENT_OUTLOOK_` or `REGENT_CUSTOM_`.

## Required Controls

The `controls` array must include:

- `send-adapter`
- `suppression-enforcement`
- `unsubscribe-enforcement`
- `audit-logging`
- `retry-failure-handling`
- `manual-setup-review`

This guard is still not permission to send. `canSend` should only change inside a provider-specific implementation task with provider tests, audit coverage, and reviewed setup evidence.
