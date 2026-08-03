# Production Readiness Report

The middleware exposes adapter readiness at:

```text
GET http://127.0.0.1:5195/adapter-readiness
```

Use this before attempting any real provider implementation.

## Current Meaning

- `sentEnabled: false` means no adapter is allowed to send yet.
- `bookedEnabled: false` means email sending cannot create calendar bookings.
- `readyProviders` lists adapters that have passed middleware guardrails.
- `blockedProviders` lists adapters that are not ready.
- Each adapter includes `missingEnv`, `requiredSetup`, and `blockedReasons`.

## Expected Local State

In the local skeleton, every provider should remain blocked:

- `stub` is blocked because it is contract validation only.
- `gmail` is blocked until credentials, sender identity checks, suppression checks, and test-account evidence exist.
- `outlook` is blocked until credentials, sender identity checks, suppression checks, and test-account evidence exist.
- `custom` is blocked until the custom reviewed-send endpoint, API key, suppression evidence, rate-limit evidence, and audit evidence exist.

## Release Rule

If `/adapter-readiness` shows any provider as ready before the provider adapter checklist has test coverage, treat it as a release blocker.
