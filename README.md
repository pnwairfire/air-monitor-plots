# air-monitor-plots

USFS AirFire standard plots for display of hourly air quality time series data.

This package provides functions that generate
[Highcharts](https://www.highcharts.com/) configuration objects for creating
PM2.5 air quality visualizations used by the U.S. Forest Service
[AirFire team](https://www.airfire.org/).

Built for use with [air-monitor](https://www.npmjs.com/package/air-monitor) and
[air-monitor-algorithms](https://www.npmjs.com/package/air-monitor-algorithms),
these chart generators output Highcharts config objects with consistent styles
and accurate timezone handling.

 ## ✨ Features

- Returns Highcharts config objects (does not render charts)
- Works with hourly PM2.5 air quality data
- Built for use with `air-monitor` + `air-monitor-algorithms`
- Supports "small multiples" with `small_*` chart variants
- Fully timezone-aware using Luxon `DateTime` objects

## Available Plot Types

Each plot type has a full and `small_~` version:

| Function Name                  | Description                             |
|-------------------------------|-----------------------------------------|
| `timeseriesPlotConfig`        | Line chart for hourly PM2.5 and NowCast |
| `hourlyBarplotConfig`         | Barplot for NowCast values              |
| `dailyBarplotConfig`          | Barplot for daily means                 |
| `dailyRangeBarplotConfig`     | Min/max columnrange + daily means       |
| `diurnalPlotConfig`           | Diurnal cycle by hour of day            |


## Usage Example (with `timeseriesPlotConfig`)

Within the `<script></script>` portion of a web page, you might have:

```js
const monitor = new Monitor();
await monitor.loadLatest("airnow");

const ids = monitor
  .filterByValue('locationName', 'Entiat')
  .getIDs();

const id = ids[0];

const data = {
  datetime: monitor.getDatetime(),
  pm25: monitor.getPM25(id),
  nowcast: monitor.getNowcast(id),
  locationName: monitor.getMetadata(id, 'locationName'),
  timezone: monitor.getMetadata(id, 'timezone'),
  title: undefined  // Optional override
};

const config = AirMonitorPlots.timeseriesPlotConfig(data);
Highcharts.chart('container', config);
```

This assumes:
- The `highcharts`, `air-monitor` and `air-monitor-plots` packages have been loaded
- `<div id="container">` exists in the web page

## HTML Example Demos

All demo `.html` files in the `playwright/` directory use this approach,
with `await` inside `<script type="module">`. You can load them directly in a
browser or use them with Playwright tests.

## Testing

- Unit tests: `npm run test`
- Playwright visual tests: `npm run test:playwright`

To view charts manually in a browser:

```bash
npm run serve:examples:open
```

## Related Packages

- [air-monitor](https://www.npmjs.com/package/air-monitor)
- [air-monitor-algorithms](https://www.npmjs.com/package/air-monitor-algorithms)

## License

GPL-3.0-or-later
© 2024–2025 Jonathan Callahan / USFS AirFire
