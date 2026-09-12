# Real-Provider Send Adapter Implementation Plan

Use this endpoint to inspect the staged plan for a future Gmail and Outlook send-capable adapter implementation.

```text
GET http://127.0.0.1:5195/real-provider/send-adapter-implementation-plan
```

The response uses `regent-growth.real-provider-send-adapter-implementation-plan.v1` and must keep:

- `approvedForRealSend: false`
- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## Prerequisites

The plan links these prerequisites:

- `/real-provider/production-readiness-review`
- `/real-provider/rollout-gap-list`
- `/gmail/implementation-review/export`
- `/outlook/implementation-review/export`

## Implementation Stages

The stages cover:

- OAuth token loading without logging secrets
- send adapter calls behind `canSend false`
- suppression checks inside the send path
- unsubscribe language enforcement inside the send path
- provider response mapping without storing raw response bodies
- bounded retry behavior with audit entries
- manual setup approval before any provider `canSend` flag changes

## Required Tests

The required tests cover blocked defaults, suppression enforcement, unsubscribe enforcement, response mapping, audit exports with `bodyContentStored false`, and disabled integration behavior without manual approval.

This plan is not send approval. Real provider send adapters must remain disabled until the implementation is complete and separately approved.
