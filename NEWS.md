# air-monitor-plots 1.0.6

- Improved tooltip in `timeseriesPlot()`.

# air-monitor-plots 1.0.5

- Added `hourlyBarplot()`.

# air-monitor-plots 1.0.4

- Refactored to use docs/ src/ and test/ directories
- Added `dailyRangeBarplot()` for extended time ranges.:wq

# air-monitor-plots 1.0.3

- Fixed package name in package.json from ~`air-quality-plots`~ to
  `air-monitor-plots`.

# air-monitor-plots 1.0.2

- `timeseriesPlot()` now uses a local time x-axis

# air-monitor-plots 1.0.1

Initial release includes the following HighCharts configurations:

- `timeseriesPlot()` -- Returns a HighCharts configuration for a USFS AirFire standard timeseries plot.
- `dailyBarplot()` -- Returns a HighCharts configuration for a USFS AirFire standard timeseries plot.
- `diurnalPlot()` -- Returns a HighCharts configuration for a USFS AirFire standard timeseries plot.

Each configuration is available in standard and 'small' styles. The
'small' versions produce charts with minimal labeling appropriate for "small multiples". These can be created by prepending `small_` to
each of the above functions.
