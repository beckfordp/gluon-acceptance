# Plan — behaviour tags and a JSON report (gluon all-Rust prep P5b)

## Phase 1 — Tags and report
- [x] Task: JSON reporter to `target/acceptance-results.json`; NOTIF tags on us-27; README
- [x] Task: Checks — `npx bddgen`, lint, typecheck, `npm test`; `playwright test --list --reporter=json` shows the tags; tests/contract's catalogue test holds them

## Archive (2026-11-20)

Done (gluon all-Rust prep P5b, `3ea6560`): the JSON reporter writes
`target/acceptance-results.json`; us-27 tags NOTIF-F6, F16–F18, F26, F27, F31, F32. lint,
typecheck, 47/47 unit tests; `--list --reporter=json` shows the tags; tests/contract's
`behaviours check` is OK, and a wire tag is seen red. gluon `verify-port notification-service
--acceptance <synthetic all-passed report>`: functional 22/34.
