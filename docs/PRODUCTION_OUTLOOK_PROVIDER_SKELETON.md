# Production Outlook Provider Skeleton

The Outlook provider now has a provider-specific skeleton behind `createProviderSendAdapter(getProviderAdapter("outlook"))`.

This is not a live Outlook sender. The adapter must return:

- `accepted: false`
- `sent: false`
- `booked: false`
- `provider: "outlook"`
- `providerMessageId: ""`

The skeleton reports `regent-growth.provider-implementation-guard.v1` and lists missing Outlook implementation controls before any real Outlook send can be considered.

## Required Controls

The Outlook implementation remains blocked until these controls are reviewed:

- `send-adapter`
- `suppression-enforcement`
- `unsubscribe-enforcement`
- `audit-logging`
- `retry-failure-handling`
- `manual-setup-review`

## Current Behavior

The Outlook skeleton validates the reviewed send packet path, reports missing Microsoft Graph environment variables from the Outlook adapter guardrails, and includes the compatibility issue `Provider adapter outlook is not send-capable yet.`

Do not set Outlook `canSend` to true from this skeleton. That belongs in a later provider-specific send implementation with OAuth handling, Microsoft Graph response mapping, audit coverage, retry handling, suppression and unsubscribe enforcement, and manual approval.
