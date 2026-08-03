# Production Middleware Implementation Plan

This plan describes how to move from the local stub to real provider middleware without weakening the current safety gates.

## Phase 1: Middleware Skeleton

- Keep `production-provider-stub.js` as the local contract reference.
- Create provider middleware outside the browser.
- Accept only `regent-growth.reviewed-send.v1` packets.
- Require release gate evidence with every request.
- Return `sent: false` until provider-specific credentials and test accounts are ready.

## Phase 2: Provider Adapter

- Add one provider adapter at a time.
- Start with a dedicated test mailbox, not a primary business mailbox.
- Store OAuth tokens server-side only.
- Reject requests when sender email does not match the authenticated account.
- Keep calendar booking separate from email sending.

## Phase 3: Compliance Enforcement

- Add suppression-list checks before provider send.
- Add unsubscribe footer or opt-out instructions before provider send.
- Add daily rate limits per sender and per domain.
- Store before-send and after-send audit records.
- Block send when release gate or compliance checklist evidence is missing.

## Phase 4: App Integration

- Add a real-send button only after middleware passes fixture, dry-run, and test-account checks.
- Keep `Dry-run send` as the default action.
- Require manual confirmation before any real send request.
- Record real-send responses separately from dry-run history.

## Stop Conditions

- Provider token is missing or expired.
- Sender identity does not match the reviewed packet.
- Suppression or unsubscribe check fails.
- Release gate is blocked.
- Compliance checklist is incomplete.
- Middleware returns any non-2xx response.
