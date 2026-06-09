# CLAUDE_ARCHITECTURE.md
# Architecture Notes — air-monitor-plots

This document is maintained as a reference for human maintainers and as context
for AI assistants working on this codebase. Source code, the build configuration,
and human-reviewed release notes (`NEWS.md`) remain authoritative.

---

## FOR HUMANS

### Purpose and Scope

`air-monitor-plots` is a small, dependency-light JavaScript library that
generates [Highcharts](https://www.highcharts.com/) **configuration objects**
for the U.S. Forest Service [AirFire team](https://www.airfire.org/)'s standard
air quality plots. It is published to npm and consumed by web pages that display
hourly PM2.5 air quality data.

The defining design choice is that this library **produces configuration, it does
not render charts**. Each exported `~Config()` function takes plain data arrays
plus display metadata and returns a Highcharts config object. The calling page is
responsible for passing that object to `Highcharts.chart(container, config)`.

This decoupling is deliberate: the plots are reusable with data from any source
(AirNow, PurpleAir, etc.) as long as the caller assembles the expected input
object.

**What it does:**
- Provides five plot types, each with a full and a `small_*` (small-multiples) variant.
- Maps PM2.5 values to AQI categories, colors, and y-axis limits.
- Handles timezones explicitly via Luxon.

**What it does not do:**
- It does not render charts (no DOM manipulation, except the one post-render
  helper `pm25_addAQIStackedBar`).
- It does not fetch or model data (that is the job of the `air-monitor` package).
- It does not bundle Highcharts, Luxon, or `air-monitor*` — those are peer or
  external dependencies provided by the host page.
- It is not a server or service; there is no deployment, no HTTP, no runtime
  process. The deliverable is the published npm package.

### Dependencies on Other AirFire Systems

This is a leaf library with no service-to-service dependencies. At runtime in a
host page it is designed to work alongside sibling AirFire packages:

- [`air-monitor`](https://www.npmjs.com/package/air-monitor) — data model;
  supplies the `datetime`, `pm25`, `nowcast`, and metadata that callers pass in.
- [`air-monitor-algorithms`](https://www.npmjs.com/package/air-monitor-algorithms)
  — NowCast and aggregation algorithms.

These are declared as **peer** dependencies, not bundled.

Direct runtime dependencies are intentionally minimal:
- `luxon` — all date/time and timezone handling.
- `suncalc` — sunrise/sunset shading for the diurnal plot only.

### Build and Publishing

There is no deployment. The release process is an npm publish of a Rollup build.

- **Build:** `npm run build` runs Rollup (`rollup.config.js`) and produces two
  bundles in `dist/`:
  - `dist/air-monitor-plots.js` — ESM, for modern bundlers (`"module"` entry).
  - `dist/air-monitor-plots.umd.js` — UMD, minified, for direct `<script>` use
    (`"main"` entry). Exposes the global `AirMonitorPlots`.
- **Externals:** `highcharts`, `luxon`, and `suncalc` are marked `external` in
  the Rollup config and mapped to the globals `Highcharts`, `luxon`, `SunCalc`
  in the UMD build. They are never bundled.
- **Version source of truth:** `package.json`. Update it and `NEWS.md` together
  when releasing.
- **Docs:** `npm run docs` runs JSDoc (`jsdoc.conf.json`) over `src/` and writes
  HTML to `docs/`.
- **Publish:** `npm run publish:public` (`npm publish --access public`).

---
---

## FOR AI

The sections below provide architectural context to help AI assistants understand
how this codebase is structured, why it is designed the way it is, and how
changes in one area may affect others.

### Module Organization

```
src/
├── index.js            # Single public entry point; re-exports everything public
├── timeseriesPlot.js   # timeseriesPlotConfig + small_ variant
├── hourlyBarplot.js    # hourlyBarplotConfig + small_ variant
├── dailyBarplot.js     # dailyBarplotConfig + small_ variant
├── dailyRangeBarplot.js# dailyRangeBarplotConfig + small_ variant
├── diurnalPlot.js      # diurnalPlotConfig + small_ variant
├── plot-utils.js       # AQI/PM2.5 mapping + shared plot elements + validation
└── helpers.js          # Luxon DateTime type-guard helpers
```

`src/index.js` is the only public surface. Treat anything not re-exported there
as internal. Each plot module is self-contained and imports only from
`plot-utils.js` and `helpers.js`, so the modules do not depend on each other.

### Plot Config Generation (the "lifecycle")

Every `~Config()` function follows the same shape:

1. **Validate** the datetime input with `requireLuxonDateTimeArray(...)` from
   `helpers.js`. This throws if any element is not a Luxon `DateTime`. This is
   the only input validation the plot functions perform.
2. **Compute axis bounds** — `ymin` is always `0`; `ymax` comes from
   `pm25ToYMax(Math.max(...values))` (fixed breakpoints, not raw autoscale).
3. **Resolve the title** — `data.title ?? data.locationName` (caller can override).
4. **Transform data** into Highcharts series. Per-point color is assigned via
   `pm25ToColor(value)` for barplot/diurnal points (`{ y, color }` objects).
5. **Return** a plain Highcharts config object. No rendering, no side effects.

The `small_*` variant of each plot mirrors the full version but disables the
legend, hides or strips axis labels, uses thinner lines/smaller markers, and
shrinks the title font — for use in small-multiples grids.

### Input Data Contract

The input object shape differs by plot family. This is important: there is no
single universal `plotData` shape.

| Plot | Required fields |
|------|-----------------|
| `timeseriesPlotConfig` | `datetime[]`, `pm25[]`, `nowcast[]`, `locationName`, `timezone`, `title?` |
| `hourlyBarplotConfig` | `datetime[]`, `nowcast[]` (uses nowcast for bars), `locationName`, `timezone`, `title?` |
| `dailyBarplotConfig` | `daily_datetime[]`, `daily_mean[]`, `locationName`, `timezone`, `title?` |
| `dailyRangeBarplotConfig` | `daily_datetime[]`, `daily_min[]`, `daily_mean[]`, `daily_max[]`, `locationName`, `timezone`, `title?` |
| `diurnalPlotConfig` | `datetime[]`, `nowcast[]`, `hour_average[]`, `latitude`, `longitude`, `locationName`, `timezone`, `title?` |

- All `datetime` / `daily_datetime` arrays are expected to be **Luxon `DateTime`
  objects in UTC**.
- Value arrays are expected to be aligned (same length and ordering) with their
  datetime array. Note the plot functions do **not** check length alignment —
  `validatePlotArrays` (below) does, but the plot functions do not call it.

### Timezone Handling — Highest-Risk Area

Timezone correctness has historically been the main source of bugs in this
project (see `NEWS.md`: 1.2.5, 1.3.1). There are **three different timezone
strategies** depending on plot type, and changes here must be made carefully:

1. **Datetime x-axis plots (timeseries, hourly):** Use Highcharts'
   `time: { timezone, useUTC }` with `xAxis.type: "datetime"` and
   `pointStart: startTime.toMillis()`. The full variants set
   **`useUTC: undefined`** (with an explicit `// Important!` comment — this is
   the 1.3.1 fix), while the `small_` variants set **`useUTC: false`**. This
   inconsistency is intentional as currently shipped; do not "normalize" it
   without testing both rendering paths and understanding the 1.3.1 history.
2. **Categorical daily plots (daily, dailyRange):** Do **not** use a datetime
   axis. They convert each `daily_datetime` to a string category via
   `dt.setZone(timezone).toFormat("MMM dd")`. The timezone is applied here, at
   formatting time.
3. **Index-based diurnal plot:** The x-axis is hour-of-day (0–23). Local hour is
   derived per point with `dt.setZone(timezone).hour`. Sunrise/sunset shading is
   computed from `SunCalc` and converted into the local zone.

When touching any timezone code, verify against the Playwright demos and a known
location/timezone; subtle off-by-one-hour or day-boundary errors will not be
caught by the unit tests.

### Diurnal Plot — Day Slicing Logic

`diurnalPlot.js` contains the most intricate data preparation:

- It derives "today" and "yesterday" 24-hour windows from the tail of the
  `nowcast` array, anchored on the **local** hour of the last datetime:
  ```
  lastHour      = localHours[localHours.length - 1]
  today_end     = localHours.length
  today_start   = today_end - 1 - lastHour
  yesterday_*   = the 24 hours before today_start
  ```
- It plots three series: a `hour_average` ("7 Day Mean") baseline, plus
  "Yesterday" and "Today" curves.
- Sunrise/sunset come from `SunCalc.getTimes()` using the **midpoint** datetime
  and the supplied `latitude`/`longitude`, rendered as shaded `xAxis.plotBands`.

This slicing assumes a contiguous, hourly, increasing datetime array. Malformed
or gappy input will silently produce wrong windows (it is not validated here).

### AQI Mapping and Shared Plot Utilities (`plot-utils.js`)

This module is the single source of truth for how PM2.5 maps to visual output:

- `AQI_THRESHOLDS = [0, 9, 35.4, 55.4, 125.4, 225.4]` — **2024 NAAQS PM2.5**
  breakpoints. `AQI_COLORS` are the six category colors (green→maroon).
- `pm25ToAQC(pm25)` → category 1–6, or `null` for invalid input.
- `pm25ToColor(pm25)` → RGB string; returns light gray `rgb(187,187,187)` for
  null/invalid (the 1.2.4 behavior).
- `pm25ToYMax(pm25)` → y-axis max from fixed breakpoints (prevents wild
  autoscaling).
- `pm25_AQILines(width)` → Highcharts `yAxis.plotLines` array overlaying the AQI
  thresholds.
- `pm25_addAQIStackedBar(chart, width)` → the **one imperative exception**: it
  operates on an already-rendered Highcharts `chart` (uses `chart.renderer`,
  `toPixels`, etc.) rather than returning config. It guards its inputs and
  `console.warn`s instead of throwing.

Changing thresholds or colors changes how air quality is reported to the public —
treat as a deliberate, reviewed change, not a tweak.

### Validation and Error Handling

- `helpers.js` provides `requireLuxonDateTime` and `requireLuxonDateTimeArray`,
  which throw clear, named errors. These are the guards the plot functions
  actually use.
- `plot-utils.js` also exports `validatePlotArrays(datetime, pm25, nowcast)`,
  which additionally checks array presence, equal length, monotonic increasing
  datetimes (warns, does not throw), and finite-or-null values (throws).
  **Note:** `validatePlotArrays` is currently **not called** by any plot
  function — it is available for callers but is not part of the plot pipeline.
  If stronger input validation is desired, wiring this in is the natural place.
- The philosophy is fail-fast on clearly invalid type input (throw) but degrade
  gracefully on individual bad values (gray color, null handling).

### Testing

Two independent layers:

- **Unit tests (`tests/`, uvu):** `npm run test`. Each `tests/*.test.js` mirrors
  a `src/` module and asserts properties of the returned config object (e.g.
  `config.time.timezone`, `xAxis.type`, `series[].pointStart`, that small
  variants hide axes, and that invalid datetimes throw). These run in Node with
  no browser and do not render anything.
- **Visual/integration tests (`playwright/`, Playwright):**
  `npm run test:playwright`. Each `playwright/*.html` demo loads the UMD bundles
  plus real data via `monitor.loadLatest("airnow")`, renders both a full chart
  (`#container`, 1000×400) and a small chart (`#small_container`, 200×200), and
  sets `window.highchartsRenderTime`. The `*.test.js` files assert the chart SVG
  renders. These are also the basis for manual human visual inspection (open the
  `.html` directly in a browser) — the README rightly notes some chart-quality
  checks should stay human.

### Known Limitations and Future Work

- **Inconsistent `useUTC` between full and small datetime plots** (`undefined`
  vs `false`). Currently intentional but fragile; a future cleanup should
  unify the timezone strategy and verify against both rendering paths.
- **`validatePlotArrays` is dead in the plot path.** Length/alignment of the
  data arrays is not enforced by the plot functions; mismatched arrays produce
  misaligned charts rather than errors.
- **Diurnal slicing assumes clean hourly data.** Gaps or non-increasing
  datetimes yield silently wrong today/yesterday windows.
- **Playwright `vendor/` UMD bundles were removed** (commit `78b87d3`) but the
  `playwright/README.md` still documents a `vendor/` directory and load order.
  The demos and that README may need reconciliation before the visual tests run
  cleanly.
- **No CI configuration is present** in the repo; tests are run manually.
