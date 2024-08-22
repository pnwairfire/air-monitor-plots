# air-monitor-plots 1.2.2

- Fixed timezone display bug in timeseries and hourly plots.

# air-monitor-plots 1.2.1

- Fixing PM2.5_2024 NAAQS levels.

# air-monitor-plots 1.2.0

- Switching default NAAQS levels from "PM2.5" to "PM2.5_2024" in preparation
for the May 06, 2024 switch mandated by the US EPA.

# air-monitor-plots 1.1.4

- Fixed levels when "NAAQS" parameter = "PM2.5_2024".

# air-monitor-plots 1.1.0

- Updated to allow specification of "NAAQS" parameter -- either "PM2.5" or
  "PM2.5_2024".

# air-monitor-plots 1.0.9

- Removed colored lines as a default from hourlyBarplot. They can be added by
  the calling function.

# air-monitor-plots 1.0.8

- Fix red-purple threshold. Was 105.5, corrected to 150.5.

# air-monitor-plots 1.0.7

- Version bump

# air-monitor-plots 1.0.6

- Improved tooltip in `timeseriesPlot()`.

# air-monitor-plots 1.0.5:wq

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
