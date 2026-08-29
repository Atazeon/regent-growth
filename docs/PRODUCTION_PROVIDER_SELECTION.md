# Production Provider Selection

Use this endpoint after `/provider-preflight` when deciding whether Gmail, Outlook, or a custom provider should be implemented first.

```text
GET http://127.0.0.1:5195/provider-selection-plan
```

The response uses `regent-growth.real-provider-selection-plan.v1` and ranks `gmail`, `outlook`, and `custom` from current local setup evidence. It is a planning export only.

Required no-send fields:

- `approvedForRealSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Decision Inputs

Before implementing the selected provider, fill in:

- Primary sending mailbox owner
- Provider account type and domain
- OAuth or API key creation path
- Suppression-list source
- Unsubscribe or opt-out text
- Daily send limit

## Selection Rule

Start with the recommended provider only if its environment setup path is available and the preflight export has no missing test-mailbox evidence. If the recommendation is blocked by account access, choose the next ranked provider and keep `canSend` false until provider-specific tests, audit logging, suppression checks, and manual setup review pass.
