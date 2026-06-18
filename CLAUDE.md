# CLAUDE.md

AI-oriented project guide for `air-monitor-plots`. Read this first,
then consult the two companion documents as needed:

- **`.claude/CLAUDE_ARCHITECTURE.md`** — architecture, module map, call graph,
  public API contract, and design rationale.
- **`.claude/CLAUDE_STYLE_GUIDE.md`** — cross-project working principles
  (philosophy, refactoring, error handling, communication, review priorities).
  These are portable conventions shared across projects.

This file covers *conventions for this project*. The architecture doc
details *how this project works*; the style guide governs *how we write code*.

---

## Project Overview

`air-monitor-plots` is a published npm library (`air-monitor-plots`, GPL-3.0)
that produces [Highcharts](https://www.highcharts.com/) configuration objects
for USFS AirFire "standard" PM2.5 air quality plots. It is consumed by the U.S.
Forest Service [AirFire team](https://www.airfire.org/) and is intended to pair
with the `air-monitor` and `air-monitor-algorithms` packages.

Key framing for any change:

- **It builds config objects; it does not render charts.** Every `*Config()`
  function returns a plain Highcharts options Object. The caller invokes
  `Highcharts.chart(el, config)`. The one exception is `pm25_addAQIStackedBar`,
  which mutates an already-rendered chart.
- **Data is decoupled from any data model.** Functions accept plain arrays plus
  `locationName`, `timezone`, and an optional `title`. This is deliberate so a
  caller with PurpleAir (or any) data can reuse the same plots — do not couple
  these functions to `air-monitor` internals.
- The project is **stable / in maintenance** (currently v1.3.1). Changes are
  conservative and backward compatibility matters (see the API contract in the
  architecture doc).

---

## Language and Style

- Modern ES modules (`"type": "module"`). Use ES6+ syntax and `import`/`export`.
- Every exported function carries JSDoc with `@param` (including the `data.*`
  members), `@returns`, and units (`µg/m³`) where relevant.
- Each plot type ships in two variants: the full `xxxConfig` and a compact
  `small_xxxConfig` for small-multiples (no legend, hidden/abbreviated axes,
  smaller markers). Keep the two in sync when changing shared behavior.
- Source is hand-authored in `src/`; the bundles in `dist/` are generated —
  never hand-edit them.

---

## Project-Specific Constraints

### Data Conventions

- `datetime` / `daily_datetime` arrays are **Luxon `DateTime` objects in UTC**.
  Display timezone is applied per-call via the IANA `timezone` string. Inputs are
  validated by `requireLuxonDateTimeArray`; passing JS `Date` or numbers throws.
- `pm25` and `nowcast` values are **finite numbers or `null`** (null = missing).
  All value arrays must match the length of their datetime array.
- Daily plots use `daily_min`, `daily_mean`, `daily_max` aligned with
  `daily_datetime`.
- The `time.useUTC` Highcharts setting is intentionally `undefined` (not `false`)
  in the full timeseries/hourly configs — this is the v1.3.1 axis fix. Do not
  "clean it up" to a boolean. (`small_` variants use `useUTC: false`.)

### AQI / NAAQS (load-bearing)

- AQI category thresholds use the **2024 PM2.5 NAAQS** breakpoints
  `[0, 9, 35.4, 55.4, 125.4, 225.4]` with a fixed 6-color palette, both defined
  in `src/plot-utils.js`. These drive colors across every plot and downstream
  visual consistency — treat them as a public contract, not magic numbers.
- `pm25ToColor` returns light gray (`rgb(187,187,187)`) for invalid/null values.
- `pm25ToYMax` uses fixed breakpoints (not raw autoscaling). For range plots the
  y-max is derived from `daily_max` — using `daily_mean` clips tall range bars (a
  fixed bug; see git history). Don't reintroduce that.

### Public API and Compatibility

Changing exported function names, the shape of the `data` argument, the
return-object structure, units, or the AQI thresholds/colors is a breaking change
requiring a version bump and a `NEWS.md` entry. See the architecture doc for the
full contract.

### Key Dependencies

Runtime deps: `luxon` (timezone-aware datetimes) and `suncalc` (sunrise/sunset
shading in the diurnal plot). `highcharts`, `air-monitor`, and
`air-monitor-algorithms` are **peer** dependencies. Do not add or swap
dependencies without discussion.

---

## Build, Test, and Document

- `npm run build` — Rollup builds ESM (`dist/air-monitor-plots.js`) and minified
  UMD (`dist/air-monitor-plots.umd.js`). `dist/` is gitignored and regenerated;
  it ships to npm via the `files` field. Do not commit or hand-edit it.
- `npm test` — runs the [uvu](https://github.com/lukeed/uvu) unit suite over
  `tests/`. Run a single file with a name filter, e.g.
  `npx uvu tests dailyRangeBarplot`.
- `npm run test:playwright` — Playwright visual/render tests against the demo
  pages in `playwright/`. Append a name to run one, e.g.
  `npm run test:playwright timeseriesPlot`.
- `npm run docs` — JSDoc generates HTML into `docs/`.
- `npm run serve:examples:open` — serve and open the demo pages for manual
  visual inspection (charts are for human eyes; some validation is manual).

New or changed plot behavior should come with corresponding unit tests; visual
changes should be eyeballed via the Playwright demo pages.

---

## Review Expectations

When reviewing code:

1. Identify correctness issues.
2. Identify operational risks and backward-compatibility concerns.
3. Identify documentation gaps.
4. Suggest low-risk improvements.

Prioritize and communicate recommendations as described in
`.claude/CLAUDE_STYLE_GUIDE.md` (Review Priorities and Communication Style).
Do not assume a rewrite is desired.
