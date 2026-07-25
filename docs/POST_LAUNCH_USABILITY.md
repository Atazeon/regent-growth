# Post-Launch Usability Pass

Use this pass after running Regent Growth against real prospects for at least one outbound session.

## Session Setup

- Start the local server from `local-research-server.js`.
- Confirm Ollama is running with `qwen3:8b`.
- Open `http://127.0.0.1:5193/index.html`.
- Use a real target industry, location, and qualification signal set.

## Walkthrough

1. Generate discovery candidates.
2. Review source evidence and reject weak candidates.
3. Run Daily AI for a small batch.
4. Review drafted emails.
5. Send or hand off one draft through mail app, Gmail, or Outlook.
6. Mark the email sent and verify the next touch date.
7. Move a warm lead into CRM-ready handoff.
8. Assign an owner, due date, status, and handoff note.
9. Run CRM setup check and confirm the configured/unconfigured state is clear.
10. Export a CRM summary or handoff packet.

## Score Each Area

Use a 1 to 5 score:

- `1`: Blocks use.
- `2`: Confusing or slow.
- `3`: Usable with workarounds.
- `4`: Good enough for regular use.
- `5`: Smooth and obvious.

Score these areas:

- Discovery quality
- Evidence confidence
- Daily AI speed
- Email draft usefulness
- Review queue clarity
- Follow-up reminder clarity
- CRM handoff clarity
- Backup and restore confidence

## Ship Criteria

- A new user can start the local server from docs without help.
- A new user can generate and review candidates without losing context.
- A new user can send or hand off one email draft.
- A new user can understand why CRM sync is disabled or ready.
- A new user can export data before risky restore or CRM work.
