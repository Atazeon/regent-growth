# Production Outlook Reviewed Packet Preflight

Use this endpoint to validate a reviewed send packet against Outlook / Microsoft Graph setup before any Outlook send implementation exists.

```text
POST http://127.0.0.1:5195/outlook/preflight
```

Use `tests/fixtures/production-reviewed-send-valid.json` as the first request body while developing the adapter path.

The response uses `regent-growth.outlook-reviewed-packet-preflight.v1` and must keep:

- `accepted: false`
- `canSend: false`
- `sentEnabled: false`
- `bookedEnabled: false`

## What It Checks

The preflight response reports:

- `reviewedPacketValid`
- `envConfigured`
- `implementationReady`
- `envStatusEndpoint`
- `implementationGuardEndpoint`
- `issues`
- `blockedReasons`

It combines reviewed packet validation, `/outlook/status`, and `/provider-implementation-guard?provider=outlook`.

## Send Blockers

Even when `reviewedPacketValid`, `envConfigured`, and `implementationReady` are true, this endpoint must still block real Outlook sending. It is only a preflight path for implementation review. Real Outlook sending requires a separate provider-specific implementation task with Microsoft Graph OAuth handling, suppression enforcement, unsubscribe enforcement, audit logging, retry handling, and manual approval.
