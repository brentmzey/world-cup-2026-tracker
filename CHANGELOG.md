# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-07-03

### Fixed
- **Frontend / Tests**: Resolved console warning `Failed to invoke tauri command get_system_config: TypeError: window.__TAURI_INTERNALS__.invoke is not a function` during `bun test` by correcting the mock window configuration in [src/lib/config.test.ts](file:///Users/brentzey/personal/world-cup-2026-tracker/src/lib/config.test.ts). By removing the empty `__TAURI_INTERNALS__` object, the tests now correctly fall back to the standard browser / LocalStorage environment without triggering unnecessary host IPC warnings.
- **Backend / Rust**: Eliminated Rust compiler warning `warning: unused variable: app` in [src-tauri/src/lib.rs](file:///Users/brentzey/personal/world-cup-2026-tracker/src-tauri/src/lib.rs) by prefixing the unused setup parameter with an underscore (`_app`).
