# air-monitor-plots

USFS AirFire standard plots for hourly and daily air quality time series data.

This package provides functions that generate [Highcharts](https://www.highcharts.com/) configuration objects for plotting PM2.5 data in formats used by the U.S. Forest Service AirFire team.

## ✨ Features

- Returns Highcharts config objects (does not render charts)
- Supports hourly and daily air quality summaries
- Built for use with `air-monitor` + `air-monitor-algorithms`
- Supports "small multiples" with `small_*` chart variants
- Fully timezone-aware using Luxon `DateTime` objects

## 📈 Available Plot Types

Each has a full and "small" version:

| Function Name                  | Description                             |
|-------------------------------|-----------------------------------------|
| `timeseriesPlotConfig`        | Line chart for hourly PM2.5 and NowCast |
| `hourlyBarplotConfig`         | Barplot for NowCast values              |
| `dailyBarplotConfig`          | Barplot for daily means                 |
| `dailyRangeBarplotConfig`     | Min/max columnrange + daily means       |
| `diurnalPlotConfig`           | Diurnal cycle by hour of day            |

## 🌐 Browser Usage (UMD)

```html
<!-- Required Highcharts libraries -->
<script src="https://code.highcharts.com/12.3.0/highcharts.js"></script>
<script src="https://code.highcharts.com/12.3.0/modules/time.js"></script>
<script src="https://code.highcharts.com/12.3.0/highcharts-more.js"></script>
<script src="https://code.highcharts.com/12.3.0/modules/columnrange.js"></script>

<!-- UMD bundles -->
<script src="path/to/air-monitor-algorithms.umd.js"></script>
<script src="path/to/air-monitor.umd.js"></script>
<script src="path/to/air-monitor-plots.umd.js"></script>

<script>
  const config = AirMonitorPlots.timeseriesPlotConfig({
    datetime: [...], // Luxon DateTime[]
    pm25: [...],
    nowcast: [...],
    locationName: 'Entiat',
    timezone: 'America/Los_Angeles'
  });

  Highcharts.chart('container', config);
</script>
```

## 🛠️ Node / ESM Usage

Install dependencies:

```sh
npm install air-monitor air-monitor-algorithms air-monitor-plots highcharts luxon
```

```js
import Highcharts from 'highcharts';
import more from 'highcharts/highcharts-more';
import columnrange from 'highcharts/modules/columnrange';

import {
  dailyRangeBarplotConfig,
  timeseriesPlotConfig
} from 'air-monitor-plots';

more(Highcharts);
columnrange(Highcharts);

const config = dailyRangeBarplotConfig({
  daily_datetime: [...], // Luxon DateTime[]
  daily_min: [...],
  daily_max: [...],
  daily_mean: [...],
  locationName: 'Boise',
  timezone: 'America/Boise'
});

Highcharts.chart('container', config);
```

## 📦 Peer Dependencies

This package expects the following to be installed in the parent project:

```json
"peerDependencies": {
  "highcharts": "12.3.0",
  "air-monitor-algorithms": "^1.2.2"
}
```

## 📄 License

GPL-3.0-or-later
© 2024–2025 Jonathan Callahan / USFS AirFire
