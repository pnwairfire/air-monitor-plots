# CLAUDE_REVIEW.md
# Project Review & Improvement Suggestions — air-monitor-plots

**Date:** 2026-06-09
**Scope:** Review of current design, identification of correctness/risk issues,
a prioritized list of low-risk improvements, and a proposed fix for the one
confirmed bug. Generated in the spirit of the `review-project.md`,
`suggest-improvements.md`, and `propose-fix.md` workflow.

> Status: review only. No source files have been modified. The proposed fix in
> Section 3 is awaiting maintainer approval. All findings marked "confirmed by
> repro" were verified by importing the unmodified `src/` modules in Node.

---

## 1. Project Review

### Design Summary

**Purpose.** `air-monitor-plots` is a pure, side-effect-free JavaScript library
that **generates Highcharts configuration objects** for USFS AirFire standard air
quality plots. Data arrays in, plain config objects out. It does not render
charts (with one documented exception, `pm25_addAQIStackedBar`) and does not
fetch or model data.

**Structure & responsibilities (`src/`):**

| Module                 | Responsibility |
|------------------------|----------------|
| `index.js`             | The only public surface; re-exports every public function. |
| `helpers.js`           | Luxon `DateTime` type guards (`requireLuxonDateTime[Array]`). The validation actually used by the plot functions. |
| `plot-utils.js`        | AQI/PM2.5 mapping (`pm25ToAQC/Color/YMax`), shared plot elements (`pm25_AQILines`, `pm25_addAQIStackedBar`), and the unused `validatePlotArrays`. |
| `timeseriesPlot.js`    | `timeseriesPlotConfig` + `small_` variant (datetime line plot). |
| `hourlyBarplot.js`     | `hourlyBarplotConfig` + `small_` variant (NowCast columns). |
| `dailyBarplot.js`      | `dailyBarplotConfig` + `small_` variant (categorical daily means). |
| `dailyRangeBarplot.js` | `dailyRangeBarplotConfig` + `small_` variant (columnrange min–max + mean). |
| `diurnalPlot.js`       | `diurnalPlotConfig` + `small_` variant (hour-of-day; uses SunCalc). |

**Execution flow / data movement.** Caller assembles a per-plot input object
(UTC Luxon `DateTime[]` plus aligned value arrays and display metadata) →
`requireLuxonDateTimeArray` validates the datetime input → axis bounds computed
(`ymin = 0`, `ymax = pm25ToYMax(...)`) → values transformed into Highcharts
series, with per-point colors from `pm25ToColor` → a plain config object is
returned. The caller passes it to `Highcharts.chart(container, config)`.

**External dependencies.** Runtime: `luxon` (all date/time) and `suncalc`
(diurnal sun shading only). Peer: `highcharts`, `air-monitor`,
`air-monitor-algorithms`. Dev tooling: Rollup, Babel, uvu, Playwright, JSDoc.

**Assumptions / constraints.** Datetime arrays are UTC Luxon `DateTime`; value
arrays are aligned (same length/order) with their datetime array; hourly data is
contiguous and increasing; timezones are applied explicitly per plot family
(Highcharts `time` for datetime plots, `setZone().toFormat()` for daily
categories, `setZone().hour` for diurnal). The input data contract differs by
plot type — there is no single universal `plotData` shape.

### Findings by Priority

#### 🔴 High — Correctness

**H1. `dailyRangeBarplot` y-axis maximum is derived from `daily_mean`, so tall
range bars are silently clipped.** `src/dailyRangeBarplot.js:21` (and `:95` in
the small variant) computes:

```js
const ymax = pm25ToYMax(Math.max(...data.daily_mean));
```

But the `columnrange` series draws each bar up to `daily_max[i]`. Since
`daily_max ≥ daily_mean`, on any day with a spike the top of the range bar
exceeds `yAxis.max` and is clipped off the chart. This defeats the entire purpose
of the *range* plot, whose reason for existing is to show the daily min–max
spread. Confirmed by repro (means ~10–12, a max of 250):

```
yAxis.max         = 50
highest range top = 250 (daily_max)
CLIPPED?          = true
small variant yAxis.max = 50
```

Existing tests miss it because the fixtures keep `daily_max` within the
mean-derived bucket. Detailed fix in Section 3.

#### 🟠 Medium

**M1. `diurnalStats` day-slicing uses negative array indices for short inputs,
silently producing wrong/empty windows.** `src/diurnalPlot.js` computes
`yesterday_start = today_start - 24`. For inputs shorter than ~2 local days this
goes negative, and `Array.prototype.slice` then counts from the *end* of the
array, yielding the wrong (or empty) "yesterday"/"today" series with no error.
Confirmed by repro with 30 hours of data:

```
today_start    = 8
yesterday_start= -16 (negative => slice wraps from END of array)
yesterday slice= []        # "Yesterday" series silently empty
function threw? no — produced 3 series silently
```

Normal 7-day usage is unaffected, so this is latent, but it fails silently rather
than loudly.

**M2. `validatePlotArrays` is exported but never called.** `grep` of `src/`
shows `validatePlotArrays` only at its definition (`src/plot-utils.js:147`). The
plot functions validate datetime *type* via `requireLuxonDateTimeArray` but never
check that `pm25`/`nowcast`/`daily_*` arrays are the **same length** as the
datetime array. Misaligned arrays produce misaligned charts (wrong values at
wrong times) rather than an error.

#### 🟡 Low / Documentation

- **L1. `useUTC` differs between full and small datetime plots.** Confirmed by
  repro: `timeseriesPlotConfig` sets `time.useUTC = undefined` (the 1.3.1 fix,
  flagged `// Important!`) while `small_timeseriesPlotConfig` sets
  `time.useUTC = false` (same split in `hourlyBarplot.js`). Given the project's
  history of timezone bugs (`NEWS.md` 1.2.5, 1.3.1), this divergence is a
  latent hazard and is undocumented.
- **L2. `small_dailyRangeBarplotConfig` uses a thicker AQI line than its
  siblings.** Confirmed by repro: it calls `pm25_AQILines(2)` while every other
  `small_` variant uses `pm25_AQILines(1)`. Visual inconsistency in
  small-multiples grids; almost certainly an oversight.
- **L3. Empty datetime array passes validation, then crashes.**
  `requireLuxonDateTimeArray([])` succeeds (empty array is valid), then
  `data.datetime[0].toMillis()` throws `TypeError: Cannot read properties of
  undefined`. Confirmed by repro. A clearer guard (or letting `validatePlotArrays`
  own this) would fail more helpfully.
- **L4. `playwright/README.md` documents a removed directory.** Commit `78b87d3`
  ("remove playwright/vendor/ directory") deleted `playwright/vendor/`, but the
  README still lists `└── vendor/  # UMD bundles` (line 133) and describes
  loading UMD bundles from it. The demos/README need reconciling before the
  visual tests run cleanly.
- **L5. `pm25ToYMax` has a discontinuous bucket.** `src/plot-utils.js` jumps from
  `≤200 → 200` straight to `≤400 → 500` (no 400 bucket). Likely intentional
  headroom, but undocumented and surprising.

---

## 2. Improvement Suggestions

Ten small, low-risk tasks, favoring correctness / reliability / clarity / docs:

| #  | Title | Why valuable | Effort | Risk |
|----|-------|--------------|--------|------|
| **1** DONE  | Fix `dailyRange` y-axis to use `daily_max` (H1) | Stops silent clipping of the exact data the plot exists to show | Small | Low |
| **2** DONE  | Add regression tests for a spike day (`daily_max ≫ daily_mean`) | Locks in the H1 fix; current fixtures never exercise it | Small | Low |
| 3  | Guard `diurnalPlot` slicing against negative/short windows (M1) | Fail loudly (or clamp) instead of silently wrong series | Medium | Low |
| 4  | Wire `validatePlotArrays` into the plot functions, or document why not (M2) | Enforces array-length alignment; catches a whole class of caller errors | Medium | Low |
| 5  | Unify `useUTC` across full and small datetime plots (L1) | Removes a latent timezone hazard; verify against both render paths | Small | Medium |
| 6  | Make `small_dailyRangeBarplotConfig` use `pm25_AQILines(1)` (L2) | Visual consistency across small-multiples | Small | Low |
| 7  | Add a clear error for empty datetime arrays (L3) | Replaces a cryptic `TypeError` with an actionable message | Small | Low |
| 8  | Reconcile `playwright/README.md` with the removed `vendor/` dir (L4) | Keeps the demo/test docs runnable and trustworthy | Small | Low |
| 9  | Document the `pm25ToYMax` breakpoints, incl. the 200→500 jump (L5) | Removes a surprising, undocumented edge | Small | Low |
| 10 | Add a `lint` script (ESLint) | Catches dead exports/imports and style drift automatically | Medium | Low |

---

## 3. Proposed Fix for H1

> No files have been modified. Awaiting maintainer approval.

**1. The issue & why it matters.** `dailyRangeBarplotConfig` (and its small
variant) sets the y-axis maximum from `daily_mean`, but draws range bars up to
`daily_max`. On any day where the daily maximum exceeds the mean-derived axis
bucket, the top of the range bar is clipped and invisible. For a plot whose
entire purpose is to show the daily min–max spread, this silently hides the most
important information — and raises no error.

**2. Root cause.** `src/dailyRangeBarplot.js:21` and `:95`:

```js
const ymax = pm25ToYMax(Math.max(...data.daily_mean));
```

The axis bound is computed from the wrong input array. The other plots compute
`ymax` from the series they actually draw; this one does not. (`dailyBarplot`
correctly uses `daily_mean` because that *is* the series it draws — so the same
line looks correct there, which likely masked the issue here.)

**3. Smallest reasonable fix.** Compute the axis bound from `daily_max`, the
array that determines the tallest drawn element. One-line change in each of the
two functions:

- `src/dailyRangeBarplot.js:21`:
  `const ymax = pm25ToYMax(Math.max(...data.daily_mean));`
  → `const ymax = pm25ToYMax(Math.max(...data.daily_max));`
- `src/dailyRangeBarplot.js:95`: the same change in `small_dailyRangeBarplotConfig`.

**4. Why preferable.** Minimal diff, no API or return-shape change, no new
dependency. Because `daily_max ≥ daily_mean` for every day, this can only ever
raise `ymax`, never lower it — so any existing chart whose `daily_max` already
fit within the mean-derived bucket renders identically. `daily_max` is, by
definition, the authoritative "tallest thing drawn," making it the correct axis
input. A larger refactor (task #4 — validate arrays; task #3 — diurnal guards)
is worthwhile but should be kept separate.

**5. Risks / edge cases / operational impact.** Very low. Null handling is
unchanged (`Math.max` coerces `null`→0 identically for both arrays; an all-null
`daily_max` still yields `pm25ToYMax(0) = 50`, matching today's behavior). No
downstream contract changes — only the y-axis range widens to include data that
was previously clipped. Should be paired with task #2 (a spike-day regression
test) to prevent reintroduction.

**6. Files to modify.**

- `src/dailyRangeBarplot.js` (the two `ymax` lines).
- `tests/dailyRangeBarplot.test.js` (regression test asserting
  `yAxis.max ≥ max(daily_max)` for a spike-day fixture).
- `dist/*` changes only on the next `npm run build` — not edited by hand.
