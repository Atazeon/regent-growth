# Production Test-Mailbox Run Packet

Use the run packet to rehearse the complete local test-mailbox provider flow.

## Endpoint

```text
GET http://127.0.0.1:5195/test-mailbox/run-packet
```

## Packet Contents

- schema: `regent-growth.test-mailbox-run-packet.v1`
- provider: `test-mailbox`
- mode: `capture-only`
- send enabled: `false`
- booking enabled: `false`
- status endpoint: `/test-mailbox/status`
- capture endpoint: `/test-mailbox/capture`
- capture export endpoint: `/test-mailbox/capture/export`
- replay fixture: `tests/fixtures/production-test-mailbox-reviewed-send.json`
- mismatch fixture: `tests/fixtures/production-test-mailbox-mismatch-reviewed-send.json`

## Rehearsal Sequence

1. Set `REGENT_EMAIL_PROVIDER` to `test-mailbox`.
2. Set `REGENT_TEST_MAILBOX_SENDER` to the reviewed sender.
3. Set `REGENT_TEST_MAILBOX_ADDRESS` to the test recipient.
4. Check `/test-mailbox/status`.
5. Run `/test-mailbox/capture` with the matching fixture.
6. Run `/test-mailbox/capture` with the mismatch fixture and confirm rejection.
7. Export `/test-mailbox/capture/export` and confirm `bodyContentStored: false`.
