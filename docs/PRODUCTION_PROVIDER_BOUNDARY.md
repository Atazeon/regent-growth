# Production Provider Implementation Boundary

This document defines what Regent Growth supports today and what must be added before real production email or calendar automation is allowed.

For a concise current-state summary, see `docs/PRODUCTION_INTEGRATION_STATUS.md`.

## Implemented Now

- Local production provider setup form.
- Local provider environment status check through `/api/production-integration-status`.
- Reviewed send packet JSON export.
- Reviewed send packet validation preview.
- Reviewed send packet audit log.
- Reviewed provider dry-run endpoint at `/api/production-send-dry-run`.
- Dry-run result history and retry packet export.
- Production send compliance checklist.
- Production send release gate summary.

## Not Implemented Yet

- Real Gmail API sending.
- Real Microsoft Graph or Outlook sending.
- Real custom provider sending.
- Automatic follow-up sending.
- Automatic calendar booking.
- OAuth consent flow.
- Token storage or refresh handling.
- Bounce, unsubscribe, suppression, or complaint processing.

## Required Before Real Sending

1. Complete the production send compliance checklist.
1. Keep the reviewed send packet schema as the only accepted input.
1. Add provider middleware that performs OAuth and sends server-side only.
1. Implement the middleware contract in `docs/PRODUCTION_MIDDLEWARE_CONTRACT.md`.
1. Add unsubscribe and suppression-list handling before any cold outreach.
1. Add rate limits and throttling before batch sending.
1. Add provider-specific test accounts and fixture-based integration tests.
1. Require a successful dry run and release gate summary before any real send action is exposed.

## Safety Rule

The current app must not send production email or create calendar bookings automatically. Any future implementation must preserve reviewed handoff as the default state until credentials, scopes, compliance, logging, and rollback procedures are verified.
