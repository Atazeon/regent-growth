# Production Gmail Provider Skeleton

The Gmail provider now has a provider-specific skeleton behind `createProviderSendAdapter(getProviderAdapter("gmail"))`.

This is not a live Gmail sender. The adapter must return:

- `accepted: false`
- `sent: false`
- `booked: false`
- `provider: "gmail"`
- `providerMessageId: ""`

The skeleton reports `regent-growth.provider-implementation-guard.v1` and lists missing Gmail implementation controls before any real Gmail send can be considered.

## Required Controls

The Gmail implementation remains blocked until these controls are reviewed:

- `send-adapter`
- `suppression-enforcement`
- `unsubscribe-enforcement`
- `audit-logging`
- `retry-failure-handling`
- `manual-setup-review`

The corresponding evidence flags are documented in `docs/PRODUCTION_PROVIDER_IMPLEMENTATION_GUARD.md`.

## Current Behavior

The Gmail skeleton validates the reviewed send packet path, reports missing environment variables from the Gmail adapter guardrails, and includes the compatibility issue `Provider adapter gmail is not send-capable yet.`

Do not set Gmail `canSend` to true from this skeleton. That belongs in a later provider-specific send implementation with OAuth handling, provider response mapping, audit coverage, retry handling, and manual approval.
