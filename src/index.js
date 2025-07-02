/**
 * The air-monitor-plots module contains functions that generate Highcharts plot
 * configurations for USFS AirFire "standard" air quality plots. Each ~Config()
 * function accepts arrays of data as well as a `locationName`, `timezone` and
 * `title` associated with the time series and returns a configuration Object
 * which can be passed on to Highcharts:
 *
 * ```
 * const plotData = {
 *   datetime: [...],
 *   pm25: [1,4,2,5,3,6],
 *   nowcast: [1,3,3,4,4,5],
 *   locationName: 'my location',
 *   timezone: 'America/Los_Angeles',
 *   title: undefined // use default title
 * }
 *
 * let context = document.getElementById('my-chart-location');
 * let chartConfig = diurnalPlotConfig(plotData);
 * let myChart = Highcharts.chart(context, chartConfig)
 * ```
 *
 * This decoupling of plotting from any specific data model allows us to reuse
 * the chart configurations. Someone with PurpleAir data need only construct
 * the `plotData` object with the appropriate `datetime`, `pm25` and `nowcast`
 * arrays and they can generate the same plot for a PurpleAir sensor.
 */

export {
  dailyBarplotConfig,
  small_dailyBarplotConfig,
} from "./dailyBarplot.js";

export {
  hourlyBarplotConfig,
  small_hourlyBarplotConfig,
} from "./hourlyBarplot.js";

export {
  dailyRangeBarplotConfig,
  small_dailyRangeBarplotConfig,
} from "./dailyRangeBarplot.js";

export {
  diurnalPlotConfig,
  small_diurnalPlotConfig
} from "./diurnalPlot.js";

export {
  timeseriesPlotConfig,
  small_timeseriesPlotConfig,
} from "./timeseriesPlot.js";

export {
  pm25ToAQC,
  pm25ToColor,
  pm25ToYMax,
  pm25_AQILines,
  pm25_addAQIStackedBar,
} from "./plot-utils.js";
