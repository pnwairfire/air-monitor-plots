// Utility functions
import { pm25ToYMax, pm25_AQILines } from "./plot-utils.js";
import { requireLuxonDateTimeArray } from "./helpers.js";

/**
 * Returns a timeseriesPlot chart configuration.
 * @param {Object} data The data required to create the chart.
 * @param {DateTime[]} data.datetime - Array of Luxon DateTime objects in UTC.
 * @param {number[]} data.pm25 - PM2.5 values aligned with datetime.
 * @param {number[]} data.nowcast - NowCast values aligned with datetime.
 * @param {string} data.locationName - Site or label name.
 * @param {string} data.timezone - IANA timezone string for x-axis display.
 * @param {string} [data.title] - Optional custom chart title.
 * @returns {Object} Highcharts chart config.
 */
export function timeseriesPlotConfig(data) {
  requireLuxonDateTimeArray(data.datetime, "datetime");

  const startTime = data.datetime[0]; // assumed to be Luxon DateTime
  const ymin = 0;
  const ymax = pm25ToYMax(Math.max(...data.pm25));

  const title = data.title ?? data.locationName;

  return {
    accessibility: { enabled: false },
    chart: {
      animation: false,
      plotBorderColor: "#ddd",
      plotBorderWidth: 1,
    },
    plotOptions: {
      series: { animation: false },
    },
    tooltip: { shared: true },
    title: { text: title },
    time: {
      timezone: data.timezone,
      useUTC: true,
    },
    xAxis: {
      type: "datetime",
      gridLineColor: "#ddd",
      gridLineDashStyle: "Dash",
      gridLineWidth: 1,
      minorTicks: true,
      minorTickInterval: 3 * 3600 * 1000, // every 3 hours
      minorGridLineColor: "#eee",
      minorGridLineDashStyle: "Dot",
      minorGridLineWidth: 1,
    },
    yAxis: {
      min: ymin,
      max: ymax,
      gridLineColor: "#ddd",
      gridLineDashStyle: "Dash",
      gridLineWidth: 1,
      title: {
        text: "PM2.5 (\u00b5g/m\u00b3)",
      },
      plotLines: pm25_AQILines(2),
    },
    legend: {
      enabled: true,
      verticalAlign: "top",
    },
    series: [
      {
        name: "Hourly PM2.5",
        type: "line",
        pointInterval: 3600 * 1000,
        pointStart: startTime.toMillis(),
        data: data.pm25,
        lineWidth: 0,
        color: "transparent",
        marker: {
          enabled: true,
          radius: 3,
          symbol: "circle",
          fillColor: "#bbbbbb",
        },
      },
      {
        name: "Nowcast",
        type: "line",
        lineWidth: 2,
        pointInterval: 3600 * 1000,
        pointStart: startTime.toMillis(),
        data: data.nowcast,
        color: "#000",
        marker: { radius: 1, symbol: "square", fillColor: "transparent" },
      },
    ],
  };
}

/**
 * Returns a simplified version of the timeseries plot configuration.
 * This small variant disables legends and axis labels for use in
 * small-multiples or compact visual displays.
 *
 * @param {Object} data The data required to create the chart.
 * @param {DateTime[]} data.datetime - Array of Luxon DateTime objects in UTC.
 * @param {number[]} data.pm25 - PM2.5 values aligned with datetime.
 * @param {number[]} data.nowcast - NowCast values aligned with datetime.
 * @param {string} data.locationName - Site or label name.
 * @param {string} data.timezone - IANA timezone string for x-axis display.
 * @param {string} [data.title] - Optional custom chart title.
 * @returns {Object} Highcharts chart config.
 */
export function small_timeseriesPlotConfig(data) {
  requireLuxonDateTimeArray(data.datetime, "datetime");

  const startTime = data.datetime[0];
  const ymin = 0;
  const ymax = pm25ToYMax(Math.max(...data.pm25));
  const title = data.title ?? data.locationName;

  return {
    accessibility: { enabled: false },
    chart: {
      animation: false,
    },
    plotOptions: {
      series: { animation: false },
      scatter: {
        animation: false,
        marker: { radius: 2, symbol: "circle", fillColor: "#bbbbbb" },
      },
      line: {
        animation: false,
        color: "#000",
        lineWidth: 0.5,
        marker: { enabled: false },
      },
    },
    title: {
      text: title,
      style: { color: "#333333", fontSize: "12px" },
    },
    time: {
      timezone: data.timezone,
      useUTC: true,
    },
    xAxis: {
      type: "datetime",
      visible: false,
    },
    yAxis: {
      min: ymin,
      max: ymax,
      title: { text: "" },
      plotLines: pm25_AQILines(1),
    },
    legend: { enabled: false },
    series: [
      {
        name: "Hourly PM2.5 Values",
        type: "scatter",
        pointInterval: 3600 * 1000,
        pointStart: startTime.toMillis(),
        data: data.pm25,
      },
      {
        name: "Nowcast",
        type: "line",
        lineWidth: 1,
        pointInterval: 3600 * 1000,
        pointStart: startTime.toMillis(),
        data: data.nowcast,
      },
    ],
  };
}
