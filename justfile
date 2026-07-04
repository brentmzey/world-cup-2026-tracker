# World Cup 2026 Tracker Justfile
# Use "just <recipe>" to run a command. Use "just" to list all available recipes.

# List all available recipes (default)
default:
    @just --list

# Install project dependencies
install:
    bun install

# --- Development ---

# Start the Web UI dev server (port 4321)
dev-web:
    bun run dev

# Start the Desktop app in development mode
dev-desktop:
    bun run tauri dev

# Start the iOS app in development mode (requires Xcode)
dev-ios:
    bun run tauri ios dev

# Start the Android app in development mode (requires Android Studio)
dev-android:
    bun run tauri android dev

# --- Testing & Code Quality ---

# Run frontend unit & integration tests
test-unit:
    bun test

# Run Rust backend integration tests
test-integration:
    cargo test --manifest-path src-tauri/Cargo.toml

# Run all unit and integration tests
test-all: test-unit test-integration

# Run Rust compilation checks and clippy lints
check:
    cargo check --manifest-path src-tauri/Cargo.toml
    cargo clippy --manifest-path src-tauri/Cargo.toml

# --- Builds ---

# Build static web frontend
build-web:
    bun run build

# Build optimized desktop installer bundles (.dmg, .app, .msi, etc.)
build-desktop:
    bun run tauri build

# Build optimized desktop binary only (faster, skips installer packaging)
build-desktop-fast:
    bun run tauri build --no-bundle

# Build native iOS packages
build-ios:
    bun run tauri ios build

# Build native Android packages
build-android:
    bun run tauri android build

# Perform checks, tests, and build all primary targets (web + desktop)
build-all: check test-all build-web build-desktop-fast

# --- Maintenance & Git Integration ---

# Clean up all build and compilation artifacts
clean:
    rm -rf dist
    rm -rf src-tauri/target
    rm -rf .astro

# Initialize and seed PocketBase with live World Cup data from openfootball API
db-seed:
    bun run scripts/seed-db.ts

# Run all checks/tests, build, stage changes, commit, and push to git
ship commit_message="build: update assets and pass tests": check test-all build-web build-desktop-fast
    git add .
    git commit -m "{{commit_message}}"
    git push
