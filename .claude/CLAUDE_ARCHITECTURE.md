# CLAUDE_ARCHITECTURE.md
# Architecture Notes — air-monitor-plots

This document is maintained as a reference for human maintainers and as context
for AI assistants working on this codebase. Source code, inline comments, and
human-reviewed release notes remain authoritative.

---

## FOR HUMANS

### Purpose and Scope

`air-monitor-plots` generates Highcharts **configuration objects** for the USFS
AirFire family of standard PM2.5 air quality plots. It does **not** render
charts, fetch data, or compute air-quality algorithms (NowCast, daily/diurnal
aggregation). Those are the caller's responsibility — typically via the
`air-monitor` and `air-monitor-algorithms` packages. The library's only job is to
turn already-prepared arrays into consistent, timezone-correct Highcharts options.

Five plot types are provided, each in a full and `small_` (small-multiples)
variant:

| Plot                       | Purpose                                   |
|----------------------------|-------------------------------------------|
| `timeseriesPlot`           | Hourly PM2.5 points + NowCast line        |
| `hourlyBarplot`            | Bars of hourly NowCast values             |
| `dailyBarplot`             | Bars of daily mean PM2.5                  |
| `dailyRangeBarplot`        | Daily min–max columnrange + mean markers  |
| `diurnalPlot`              | Average-by-hour cycle with day/night shade|

### Directory Structure

| Path                  | Responsibility                                          |
|-----------------------|---------------------------------------------------------|
| `src/index.js`        | Public entry point; re-exports all plot + util functions |
| `src/*Plot.js`, `src/*Barplot.js` | One file per plot type (full + `small_`)     |
| `src/plot-utils.js`   | AQI/NAAQS thresholds, colors, y-max, AQI overlays, array validation |
| `src/helpers.js`      | Luxon `DateTime` type guards                             |
| `tests/`              | uvu unit tests, one file per source module              |
| `playwright/`         | Standalone demo `.html` pages + Playwright render tests  |
| `examples/`           | Self-contained demo HTML for showcasing the package      |
| `dist/`               | Generated ESM + UMD bundles (gitignored)                |
| `docs/`               | Generated JSDoc HTML                                     |

### Relationship to Other Systems

- **Peer dependencies:** `highcharts` (consumes the configs), `air-monitor`, and
  `air-monitor-algorithms` (typical source of the input arrays). These are peers,
  not bundled, so the host app controls their versions.
- **Runtime dependencies:** `luxon` (timezone math) and `suncalc` (sunrise/sunset
  for diurnal shading).
- The **function names, the `data` argument shape, return-object structure, units
  (µg/m³), and AQI thresholds/colors are a public contract** relied on by AirFire
  web apps. See "Public API Contract" below.

### Distribution and Installation

- Published to npm as `air-monitor-plots` (GPL-3.0-or-later). Installed with
  `npm install air-monitor-plots` alongside its peers.
- The version number lives in `package.json` (`version`); release notes in
  `NEWS.md`.
- `package.json` `files` ships `dist/`, `src/`, `README.md`, and `LICENSE`.
  `main`/`module`/`exports` point at the two `dist/` bundles, so `npm run build`
  must run before publishing. `npm run publish:public` publishes with public
  access.

---

## FOR AI

The sections below provide architectural context to help AI assistants understand
how this codebase is structured, why it is designed the way it is, and how
changes in one area may affect others.

### Core Data Conventions

Every plot function takes a single `data` object. The foundational assumptions
(all load-bearing for downstream consumers) are:

- **Datetimes are Luxon `DateTime` objects in UTC.** `datetime` (hourly plots) or
  `daily_datetime` (daily plots). The display `timezone` (IANA string) is applied
  per-call via `dt.setZone(timezone)` or Highcharts `time.timezone`. The raw data
  is never pre-shifted.
- **Values are finite numbers or `null`.** `null` represents missing data and
  flows through to gray markers / gaps. `pm25` and `nowcast` are the hourly
  arrays; `daily_min` / `daily_mean` / `daily_max` are the daily arrays.
- **Arrays are parallel and equal-length**, aligned index-for-index with their
  datetime array.
- **Units are µg/m³** throughout.
- The diurnal plot additionally needs `latitude` / `longitude` (for SunCalc) and
  a precomputed `hour_average` array.

### Module Map

| Module | Key exports | Role |
|--------|-------------|------|
| `index.js` | re-exports everything | Public surface |
| `timeseriesPlot.js` | `timeseriesPlotConfig`, `small_…` | Hourly PM2.5 + NowCast line |
| `hourlyBarplot.js` | `hourlyBarplotConfig`, `small_…` | Hourly NowCast bars |
| `dailyBarplot.js` | `dailyBarplotConfig`, `small_…` | Daily mean bars |
| `dailyRangeBarplot.js` | `dailyRangeBarplotConfig`, `small_…` | Daily min–max range + mean |
| `diurnalPlot.js` | `diurnalPlotConfig`, `small_…` | Hour-of-day cycle + day/night shading |
| `plot-utils.js` | `pm25ToAQC`, `pm25ToColor`, `pm25ToYMax`, `pm25_AQILines`, `pm25_addAQIStackedBar`, `validatePlotArrays` | AQI math + shared chart helpers |
| `helpers.js` | `requireLuxonDateTime`, `requireLuxonDateTimeArray` | Input type guards |

### Dependency / Call Graph

```
index.js
  └── (each *Plot.js / *Barplot.js)
        ├── plot-utils.js   → pm25ToColor / pm25ToYMax / pm25_AQILines
        └── helpers.js      → requireLuxonDateTimeArray
plot-utils.js
  └── helpers.js            → requireLuxonDateTimeArray (in validatePlotArrays)
diurnalPlot.js
  └── luxon + suncalc       (only plot using suncalc)
```

`plot-utils.js` and `helpers.js` are the shared foundations: a change to the AQI
thresholds/colors, `pm25ToYMax`, or the validators affects every plot.

### Key Design Decisions

1. **Configs, not charts.** Functions return Highcharts options and let the caller
   render. This keeps the library renderer-version-agnostic and trivially testable
   (assert on plain objects, no DOM). Don't add rendering into the `*Config`
   functions.
2. **Data decoupled from `air-monitor`.** Plain arrays + metadata in, so any data
   source (PurpleAir, custom) can drive the same plots. Resist coupling to a
   specific monitor object.
3. **UTC data + per-call timezone.** Storing datetimes in UTC and shifting only at
   display time avoids DST/offset bugs. `time.useUTC` is deliberately `undefined`
   in full timeseries/hourly configs (the v1.3.1 fix) so Highcharts honors
   `time.timezone`; `small_` variants use `useUTC: false`. These are not
   interchangeable — leave them as-is.
4. **Fixed y-max breakpoints, not autoscale.** `pm25ToYMax` snaps to a fixed
   ladder so charts across sites/times stay visually comparable. Range plots
   derive y-max from `daily_max` (not `daily_mean`) so tall range bars aren't
   silently clipped — a previously fixed bug.
5. **2024 NAAQS hard-coded.** The selectable-NAAQS argument was removed (v1.2.3);
   thresholds and colors are now constants in `plot-utils.js` for consistency.

### Public API Contract

A version bump + `NEWS.md` entry is warranted when changing any of:

- Exported function names (incl. the `small_` variants and the `pm25*` utilities).
- The accepted `data` object keys / shape, or the units of inputs/outputs.
- The structure of returned Highcharts config objects in ways consumers depend on.
- AQI thresholds, colors, or the `pm25ToYMax` ladder (visual contract).

### Validation and Error Handling

| Condition | Behavior | Where |
|-----------|----------|-------|
| `datetime` not an array / element not a Luxon `DateTime` | **throws** | `helpers.js` (`requireLuxonDateTimeArray`), called at top of each plot |
| `datetime`/`pm25`/`nowcast` not arrays or mismatched length | **throws** | `validatePlotArrays` |
| `pm25`/`nowcast` value not finite-number-or-null | **throws** | `validatePlotArrays` |
| datetime array not strictly increasing | **`console.warn`**, continues | `validatePlotArrays` |
| invalid/null PM2.5 in color/category lookup | returns `null` (AQC) / gray (color) | `plot-utils.js` |
| invalid PM2.5 in `pm25ToYMax` | returns default `50` | `plot-utils.js` |
| malformed chart passed to `pm25_addAQIStackedBar` | **`console.warn`**, returns | `plot-utils.js` |

Note: not every plot routes through `validatePlotArrays` — most call only
`requireLuxonDateTimeArray` directly. Reliable, explicit failure is preferred
over silent fallbacks.

### Build and Distribution

Rollup (`rollup.config.js`) emits two bundles from `src/index.js`: an ESM build
and a minified UMD build (global `AirMonitorPlots`). `highcharts`, `luxon`, and
`suncalc` are marked `external`. Build with `npm run build`; output lands in
`dist/` (gitignored, regenerated, never hand-edited).

### Testing

[uvu](https://github.com/lukeed/uvu) unit tests in `tests/`, one file per source
module, run with `npm test` (single file: `npx uvu tests <name>`). Playwright
render/visual tests in `playwright/` exercise the demo HTML pages
(`npm run test:playwright [name]`). No CI config is checked in; charts are also
validated by human eye via the demo pages.

### Documentation

JSDoc, configured in `jsdoc.conf.json`, generates HTML to `docs/` via
`npm run docs` (uses `README.md` as the landing page). Keep exported-function
JSDoc current — it is the primary API reference.

### Known Limitations and Future Work

- Aggregations (NowCast, daily/diurnal means, `hour_average`) are computed
  upstream, not here; this library trusts its inputs.
- Validation coverage is uneven across plots (see the validation table) — some
  plots type-check datetimes only.
- 2024 NAAQS thresholds are intentionally hard-coded; making them configurable
  again would be a deliberate API change, not a cleanup.
- No automated visual-regression baselines are committed; Playwright tests focus
  on render success/timing, with pixel comparison left to manual inspection.
