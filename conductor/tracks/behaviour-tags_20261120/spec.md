# Spec — behaviour tags and a JSON report (gluon all-Rust prep P5b)

## Why
gluon's behaviour catalogue (`tests/contract/docs/behaviours.md`) counts a functional
row met from contract checks; the all-Rust session goes acceptance first, so scenarios
are to count too (tests/contract track `acceptance-evidence_20261120`).

## What
- A scenario (or its feature) tags each functional row it exercises: `@NOTIF-F16`.
  Seeded on us-27 from the catalogue's "Met by" column: NOTIF-F6, F16–F18, F26, F27,
  F31, F32. The coverage matrix reads `@US-…` tags only, so it is unchanged.
- Playwright also writes `target/acceptance-results.json` (JSON reporter): gluon
  `bin/verify-port <svc> --acceptance tests/acceptance/target/acceptance-results.json`.
- README: the tag and the report.
