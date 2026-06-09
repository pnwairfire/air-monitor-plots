# CLAUDE.md

## Project Overview

This project, `air-monitor-plots`, is a JavaScript library that generates
[Highcharts](https://www.highcharts.com/) configuration objects for USFS AirFire
"standard" air quality plots. It is published as an npm package and consumed by
web pages that display hourly PM2.5 air quality time series data for the U.S.
Forest Service [AirFire team](https://www.airfire.org/).

Features:

- Returns Highcharts config objects; it does **not** render charts itself.
- Works with hourly PM2.5 air quality data.
- Built for use with the `air-monitor` and `air-monitor-algorithms` packages.
- Supports "small multiples" via `small_*` chart variants.
- Fully timezone-aware using Luxon `DateTime` objects.

Plot generators are intentionally decoupled from any specific data model. Each
`~Config()` function accepts plain arrays of data plus a `locationName`,
`timezone`, and optional `title`, and returns a configuration object. This lets
the same plots be reused with data from any source (AirNow, PurpleAir, etc.) as
long as the caller assembles the expected `plotData` object.

The primary goals of this project are:

- Reliability
- Operational transparency
- Maintainability
- Simplicity

This project is operational infrastructure used to visualize air quality data
for the public and for operational staff. Correctness and robustness are more
important than architectural sophistication.

---

## Known Preferences of the Maintainer

The maintainer, Jonathan Callahan, values clarity, correctness, and long-term
maintainability over novelty or abstraction.

### General Philosophy

- Prefer simple, understandable code over clever solutions.
- Favor maintainability over optimization unless performance is a demonstrated problem.
- Prefer explicit code over metaprogramming or excessive abstraction.
- Small, incremental improvements are preferred over large rewrites.
- Existing working code should be respected and changed conservatively.
- Avoid introducing complexity unless there is a clear operational benefit.

### JavaScript Style

- Use modern ES6 JavaScript.
- Use ESM (`import` / `export`) syntax. This package is `"type": "module"`.
- Prefer async/await over promise chains.
- Prefer descriptive variable and function names.
- Prefer small functions with clear responsibilities.
- Avoid introducing dependencies unless they provide significant value.

### Documentation and Comments

- Write code for future maintainers.
- Include explanatory comments describing intent, not just implementation.
- Public functions should have clear JSDoc documentation (this package
  generates API docs via `npm run docs`).
- Operational scripts should have clear file-level descriptions and usage notes.
- Many consumers of this work are scientists and operational staff who are not
  professional software engineers. Code readability and clear documentation are
  therefore especially important.

### Refactoring

- Do not propose architectural rewrites unless specifically requested.
- Preserve existing behavior unless a bug or design issue has been identified.
- When suggesting refactoring, explain the expected benefit.
- Prefer minimal diffs that are easy to review.
- Small improvements are generally preferred over large rewrites.

### Error Handling

- Failures should be detected and reported clearly.
- Avoid silent failures.
- Error messages should provide useful operational context. The existing
  `helpers.js` validators (e.g. `requireLuxonDateTime`) are a good model: they
  name the offending variable and the expected type.
- Reliability is more important than elegance.

### Communication Style

- Explain recommendations before making substantial changes.
- Distinguish between required fixes and optional improvements.
- Identify risks and tradeoffs.
- Rank recommendations by priority.
- Do not assume a rewrite is desired.

---

## Project-Specific Constraints

### Package Structure

- Source lives in `src/`. Each plot type has its own module that exports a full
  config function and a `small_*` variant
  (e.g. `timeseriesPlotConfig` / `small_timeseriesPlotConfig`).
- `src/index.js` is the single public entry point and re-exports every public
  function. Anything not exported there should be treated as internal.
- `src/plot-utils.js` holds shared AQI/PM2.5 mapping utilities; `src/helpers.js`
  holds shared validation helpers.
- The package is built with Rollup (`npm run build`) into `dist/` as both ESM
  (`air-monitor-plots.js`) and UMD (`air-monitor-plots.umd.js`). Do not hand-edit
  files in `dist/`.

### Date and Time Handling

- Use Luxon for all date and time operations.
- `datetime` arrays passed to plot functions are expected to be Luxon
  `DateTime` objects, not native `Date` objects. Validate with the helpers in
  `src/helpers.js` rather than assuming.
- Avoid mixing Luxon `DateTime` objects and native JavaScript `Date` objects.
- Be explicit about timezones rather than relying on system defaults. Plots are
  timezone-aware and receive an explicit `timezone` from the caller; respect it.
- Timezone correctness has been a real source of bugs in this project. Be
  especially careful with any change that touches `useUtc`, hour-of-day
  bucketing (diurnal plots), or day boundaries (daily plots).

### Public API and Output Stability

Be conservative when modifying:

- The set of functions exported from `src/index.js`.
- The shape of the `plotData` input object
  (`datetime`, `pm25`, `nowcast`, `locationName`, `timezone`, `title`).
- The structure of the returned Highcharts configuration objects.
- AQI category thresholds and colors in `src/plot-utils.js`.

These are consumed by downstream web pages and other AirFire tooling. Preserve
backward compatibility whenever practical, and call out any breaking change
explicitly.

### Dependencies

- Runtime dependencies are intentionally minimal: `luxon` and `suncalc`.
- `air-monitor`, `air-monitor-algorithms`, and `highcharts` are **peer**
  dependencies — they are provided by the consuming application, not bundled.
  Do not convert a peer dependency into a direct dependency without discussion.
- Avoid adding new dependencies unless they provide significant, clear value.

### AQI Thresholds and Colors

- The AQI thresholds in `src/plot-utils.js` follow the 2024 NAAQS PM2.5
  standard. Changing these values changes how air quality is reported to the
  public, so treat them as a deliberate, reviewed change — not a casual tweak.

---

## Testing

- Unit tests use [uvu](https://github.com/lukeed/uvu): `npm run test`. Test
  files live in `tests/` and mirror the `src/` modules.
- Visual/integration tests use Playwright against the demo pages in
  `playwright/`: `npm run test:playwright`.
- To view charts manually in a browser: `npm run serve:examples:open`.
- New behavior should come with a corresponding unit test where practical.

---

## Review Expectations

When reviewing code:

1. Identify correctness issues.
2. Identify operational risks (timezone handling, output structure changes,
   AQI threshold changes).
3. Identify documentation gaps.
4. Suggest low-risk improvements.

Prioritize recommendations in this order:

1. Correctness
2. Reliability
3. Maintainability
4. Readability
5. Performance

Performance optimizations should generally be proposed only after correctness
and maintainability concerns have been addressed.

Do not assume a rewrite is desired.
