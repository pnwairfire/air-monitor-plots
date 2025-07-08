# Playwright Chart Demos

This directory contains standalone HTML files for rendering charts as well as
Playwright test scripts associated with each chart. These are designed for:

- **Interactive debugging**
- **Performance benchmarking**
- **Playwright-based visual regression testing**

## How It Works

Each `.html` file:

- Loads foundational libraries (Luxon, SunCalc, Arquero, Highcharts)
- Loads UMD bundles in the correct order:
  1. `air-monitor-algorithms`
  2. `air-monitor`
  3. `air-monitor-plots`
- Uses `await monitor.loadLatest("airnow")` inside a `<script type="module">`
- Filters by `locationName = "Entiat"` (changeable for test scenarios)
- Renders both:
  - A **standard chart** in `#container` (1000×400 px)
  - A **small-multiples chart** in `#small_container` (200×200 px)

## HTML Files

| Demo Page               | Chart Type             |
|------------------------|------------------------|
| `timeseriesPlot.html`  | Time series line plot  |
| `hourlyBarplot.html`   | Hourly NowCast bars    |
| `dailyBarplot.html`    | Daily average bars     |
| `diurnalPlot.html`     | Diurnal cycles + AQI   |
| `dailyRangeBarplot.html` | Daily min–max ranges   |

## Human Visual Testing

Some things should not be automated! Given that the charts are destined for
humans, a pair of human eyes should be used to validate that the charts are
rendering properly.

You can open any `.html` file in this directory directly in Chrome for manual inspection.

### Steps

1. Open your file browser or terminal.
2. Navigate to the `playwright/` directory.
3. Open an HTML file, for example:

   ```
   open playwright/timeseriesPlot.html
   ```

4. In Chrome:
   - Press <kbd>Cmd+Option+I</kbd> (Mac) or <kbd>Ctrl+Shift+I</kbd> (Windows/Linux) to open **Developer Tools**.
   - Switch to the **Console** tab to check render time logs:
     ```js
     window.highchartsRenderTime  // ms
     ```
   - Switch to the **Elements** tab to inspect the Highcharts SVG output.
   - Use the **Sources** or **Network** tabs to verify script loading.

### Tips

- Use the **"Performance"** tab in DevTools to record and analyze the chart rendering timeline.
- In the Console, you can interact with global variables like:
  ```js
  monitor               // access underlying data
  Highcharts.charts[0]  // inspect the first chart instance
  ```

### Why Use File URLs?

These charts use only local UMD bundles and CDNs, so no local server is needed. This makes it easy to inspect or test chart rendering in isolation.

## Automated Visual Testing with Playwright

These files can be used by Playwright tests to:

- Load charts in headless or full browser mode
- Assert rendering performance and visual correctness
- Export screenshots for pixel-diff comparisons

A "scripts" target is defined in the top level `package.json` file
To run Playwright tests, got to the top level directory and type:

```bash
npm run test:playwright <test-name>
```

## 🖼️ Layout Conventions

All example HTML files use the following layout styles:

```css
#container        → 1000 × 400 px
#small_container  →  200 × 200 px

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
```

This ensures consistent screenshot dimensions for visual comparison.

## 💡 Tip

To switch test targets, replace the `"Entiat"` filter with another `locationName`:

```js
monitor.filterByValue('locationName', 'My Test Site')
```

## 📁 Directory Structure

```
playwright
├── dailyBarplot.html
├── dailyBarplot.test.js
├── dailyRangeBarplot.html
├── dailyRangeBarplot.test.js
├── diurnalPlot.html
├── diurnalPlot.test.js
├── dummy.html
├── dummy.test.js
├── hourlyBarplot.html
├── hourlyBarplot.test.js
├── README.md                    ← you are here
├── timeseriesPlot.html
├── timeseriesPlot.test.js
└── vendor/                      # UMD bundles
```

---

Happy charting!
