# Production Provider Setup Review

Use this review before connecting any real Gmail, Outlook, or custom provider.

## Required Evidence

- `/status` confirms the selected provider and skeleton state.
- `/adapter-readiness` lists the provider as blocked until all checklist gates pass.
- `/adapter-readiness/export` has been saved for the implementation review.
- `/replay` passes with the reviewed-send fixture.
- `/replay/export` has been saved without message body leakage.
- `/audit/export` confirms audit entries do not store message bodies.
- `docs/PRODUCTION_PROVIDER_ADAPTER_CHECKLIST.json` shows `canSend: false` until test coverage exists.

## Approval Rule

Do not wire a real-send button in the app until this review has been completed with a test mailbox and the provider adapter has changed from skeleton-only in a dedicated commit.
