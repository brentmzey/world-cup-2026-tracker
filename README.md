# 🏆 World Cup 2026 Tracker

An interactive, multi-platform application built to track the **FIFA World Cup 2026** across Canada, Mexico, and the United States. 

This project compiles natively to **Desktop (macOS/Windows/Linux)** and **Mobile (iOS/Android)** via **Tauri v2**, and is powered by **Astro.js** (static frontend compilation) and **Alpine.js** (lightweight reactive state). It runs on **Bun** for maximum performance.

---

## 📋 Table of Contents
1. [Project Scope & Purpose](#-project-scope--purpose)
2. [Technology Stack](#%EF%B8%8F-technology-stack)
3. [12-Factor & Multi-Tenant Architecture](#-12-factor--multi-tenant-architecture)
4. [🗺️ Geolocation & Geometric Specs](#%EF%B8%8F-geolocation--geometric-specs)
5. [🚀 Build, Test, and Run Guide](#-build-test-and-run-guide)
6. [📡 Live API Integration Recommendations](#-live-api-integration-recommendations)
7. [📂 File Structure](#-file-structure)

---

## 🎯 Project Scope & Purpose

The **World Cup 2026 Tracker** serves as a template and production blueprint for hybrid multi-tenant web/native applications. It focuses on:
* **True Multi-Platform distribution**: Build once using modern web technologies and compile natively for iOS, Android, and Desktop shells.
* **Separation of Config and Code**: Supporting the 12-Factor App methodology by injecting branding, feature toggles, and endpoints at runtime (via local ConfigMaps, system environment variables, or remote PocketBase backends) without requiring code rebuilds or separate redeploys.
* **Geographical Mapping**: Integrating interactive map rendering (via Leaflet.js) to visualize stadium locations, spectator footprint geofences, and logistics connection paths.

---

## 🛠️ Technology Stack

* **Core Runtime**: [Bun](https://bun.sh/)
* **Shell Compiler**: [Tauri v2](https://tauri.app/) (Rust-based WebView wrapper for iOS, Android, macOS, Windows, Linux)
* **Static Builder**: [Astro.js](https://astro.build/) (Static Site Generation for fast load times and clean routing)
* **Reactive Logic**: [Alpine.js](https://alpine.js.org/) (Lightweight, declarative, low-overhead JavaScript state binding)
* **Mapping**: [Leaflet.js](https://leafletjs.com/) (Open-source interactive mapping)
* **Backend Adapter**: [PocketBase SDK](https://pocketbase.io/) (Attached database resources)
* **Styling**: Pure Vanilla CSS custom properties (to support real-time runtime theme updates)

---

## 🏢 12-Factor & Multi-Tenant Architecture

Traditional builds bake settings (like API endpoints and color themes) into the bundle. This project resolves configurations at runtime through a priority-based chain:

1. **Rust Environment Probe**: On launch in a Tauri shell, the Rust backend checks system environment variables (`APP_TENANT_ID`, `APP_POCKETBASE_URL`).
2. **ConfigMap JSON Probe**: If env variables aren't set, the Rust backend searches for a local file `config.json` (similar to a mounted ConfigMap file in a Kubernetes pod).
3. **User Overrides**: Users/developers can override settings on the fly from the built-in Config Dashboard. Overrides are persisted in browser `localStorage`.
4. **Database Query**: If a PocketBase URL is set, the app queries the database collection `tenants` matching the active `tenantId` to pull the tenant's brand name, CSS variables (primary, secondary, and accent colors), and active features.
5. **Mock Fallback**: If no database is connected or reachable, the app pulls the configuration from a local static dictionary matching the tenant ID (`world-cup-classic`, `usa-pride`, `mexico-lindo`, `vancouver-breeze`).
6. **Dynamic Theme Injection**: The resolved theme variables are immediately injected into the document root as CSS custom properties, modifying the app's visual identity on the fly.

---

## 🗺️ Geolocation & Geometric Specs

The app contains geographical datasets for the **16 official host stadiums**:

### 1. Geolocation Coordinates

| Stadium ID | Venue Name | Host City | Country | Latitude | Longitude | Capacity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `azteca` | Estadio Azteca | Mexico City | Mexico | `19.3029` | `-99.1505` | 83,264 |
| `metlife` | MetLife Stadium | New York/NJ | USA | `40.8135` | `-74.0743` | 82,500 |
| `att` | AT&T Stadium | Dallas | USA | `32.7473` | `-97.0945` | 80,000 |
| `mercedes` | Mercedes-Benz Stadium | Atlanta | USA | `33.7573` | `-84.4010` | 71,000 |
| `arrowhead` | Arrowhead Stadium | Kansas City | USA | `39.0489` | `-94.4839` | 76,416 |
| `nrg` | NRG Stadium | Houston | USA | `29.6847` | `-95.4078` | 72,220 |
| `sofi` | SoFi Stadium | Los Angeles | USA | `33.9534` | `-118.3390` | 70,240 |
| `hardrock` | Hard Rock Stadium | Miami | USA | `25.9580` | `-80.2389` | 64,767 |
| `levis` | Levi's Stadium | San Francisco | USA | `37.4030` | `-121.9702` | 68,500 |
| `lumen` | Lumen Field | Seattle | USA | `47.5952` | `-122.3316` | 69,000 |
| `lincoln` | Lincoln Financial Field | Philadelphia | USA | `39.9008` | `-75.1675` | 69,796 |
| `gillette` | Gillette Stadium | Boston | USA | `42.0909` | `-71.2643` | 65,878 |
| `bmo` | BMO Field | Toronto | Canada | `43.6332` | `-79.4186` | 45,000 |
| `bcplace` | BC Place | Vancouver | Canada | `49.2767` | `-123.1120` | 54,500 |
| `bbva` | Estadio BBVA | Monterrey | Mexico | `25.6689` | `-100.2446` | 53,500 |
| `akron` | Estadio Akron | Guadalajara | Mexico | `20.6821` | `-103.4627` | 48,070 |

### 2. Geometric Layer Calculations
* **Spectator Capacity footprint**: Renders a geodesic circle centered on the active stadium with a radius of $Capacity \times 1.5$ in meters.
* **Network Vector lines**: Draws polylines connecting USA, Canada, or Mexico stadiums back to Washington D.C., Ottawa, or Mexico City respectively, forming the host nation's logistical grid on the map.

---

## 🚀 Build, Test, and Run Guide

### Prerequisite Dependencies
Make sure you have [Bun](https://bun.sh/) and [Rustup](https://rustup.rs/) installed on your machine.

* Install node/npm dependencies:
  ```bash
  bun install
  ```

---

### 1. Running the Project (Dev mode)

* **Web UI (starts dev server at port 4321)**:
  ```bash
  bun run dev
  ```
* **Desktop Application (Tauri window)**:
  ```bash
  bun run tauri dev
  ```
* **iOS Simulator** (Requires Xcode installed):
  ```bash
  bun run tauri ios dev
  ```
* **Android Emulator** (Requires Android Studio/NDK installed):
  ```bash
  bun run tauri android dev
  ```

---

### 2. Running Code Tests
* **Verify Frontend Compilation**:
  ```bash
  bun run build
  ```
* **Run Frontend Unit & Integration Tests**:
  ```bash
  bun test
  ```
* **Run Backend Host Integration Tests**:
  ```bash
  cargo test --manifest-path src-tauri/Cargo.toml
  ```
* **Check Rust compilation health**:
  ```bash
  cargo check --manifest-path src-tauri/Cargo.toml
  ```
* **Lint Rust Modules**:
  ```bash
  cargo clippy --manifest-path src-tauri/Cargo.toml
  ```

---

### 3. Compiling Release Packages
* **Build Web Assets**:
  ```bash
  bun run build
  ```
* **Build Desktop App Binary** (optimized, skipping installer bundling for faster dev checks):
  ```bash
  bun run tauri build --no-bundle
  ```
* **Build Installer Bundles** (`.dmg`, `.app` on macOS, `.msi` on Windows):
  ```bash
  bun run tauri build
  ```

---

## 📡 Live API Integration Recommendations

To integrate real-time stats, we recommend connecting the PocketBase database collections to the following sports data API endpoints:

1. **GitHub Worldcup2026 API (Free)**: Offers read-only REST access to World Cup schedules, participating teams, and live scores. It is ideal for testing and simple, keyless trackers.
2. **API-Football (Commercial/Freemium)**: Provides complete live event tracking (goals, lineups, stats, referee calls) updated every 15 seconds.
3. **Integration Strategy**: Run a cron job in your backend (e.g. PocketHost Javascript triggers) that fetches live updates from API-Football and updates your PocketBase `matches` collection. The client app then listens to PocketBase using real-time WebSockets, which limits rate-limit consumption and ensures instant push updates to all active devices.

---

## 📂 File Structure

```text
world-cup-2026-tracker/
├── src-tauri/                 # Tauri native Rust backend configuration
│   ├── src/
│   │   ├── lib.rs             # System configuration environment/file reader
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json        # Tauri desktop/mobile packaging settings
├── src/                       # Frontend application code
│   ├── components/            # Modular tab panels
│   │   ├── Matches.astro      # Fixture tracker, scores, and predictions
│   │   ├── Standings.astro    # Standings table layouts
│   │   ├── StadiumMap.astro   # Leaflet Map coordinates & geometric drawing
│   │   ├── Stadiums.astro     # Seating capacities list
│   │   └── ConfigDashboard.astro # 12-factor configuration console
│   ├── layouts/
│   │   └── Layout.astro       # Root layout & Alpine.js state provider
│   ├── lib/
│   │   ├── config.ts          # Priority-based configuration resolver
│   │   └── mockData.ts        # Geolocation, teams, and schedule database
│   ├── styles/
│   │   └── global.css         # Theme styling, layout grids, and animations
│   └── pages/
│       └── index.astro        # Astro page entrypoint
├── config.json                # Local ConfigMap file configuration
├── package.json
└── tsconfig.json
```
