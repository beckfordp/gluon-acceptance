# Plan — staged precheck (gluon all-Rust Stage A P0.5)

Spec: [spec.md](./spec.md).

## Phase 1: Staging

- [x] Task 1.1: `stagedServices(env)` and `evaluatePrecheck`'s `staged` (unit tests red first: 4 failed) `d9dc7fb`
- [x] Task 1.2: `globalSetup` probes only the staged services `d9dc7fb`
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md): 51 passed, lint and typecheck clean, coverage 100% lines

## Archive (2026-11-22)

Reviewed: no findings. Unset keeps the original precheck exactly (same services, all
connectors, catalog count); feature files and steps untouched.
