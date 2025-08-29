// Utility functions
import { pm25ToYMax, pm25ToColor } from "./plot-utils.js";
import { requireLuxonDateTimeArray } from "./helpers.js";

/**
 * Returns a Highcharts chart configuration for a full-sized hourly NowCast barplot.
 * @param {Object} data
 * @param {DateTime[]} data.datetime - Array of Luxon DateTime objects (UTC).
 * @param {number[]} data.pm25 - Raw hourly PM2.5 data.
 * @param {number[]} data.nowcast - NowCast values.
 * @param {string} data.locationName - Label for the chart.
 * @param {string} data.timezone - IANA timezone for display.
 * @param {string} [data.title] - Optional custom title.
 * @returns {Object} Highcharts chart config object.
 */
export function hourlyBarplotConfig(data) {
  requireLuxonDateTimeArray(data.datetime, "datetime");

  const startTime = data.datetime[0]; // Luxon DateTime
  const ymin = 0;
  const ymax = pm25ToYMax(Math.max(...data.nowcast));

  const title = data.title ?? data.locationName;

  const seriesData = data.nowcast.map(v => ({
    y: v,
    color: pm25ToColor(v),
  }));

  return {
    accessibility: { enabled: false },
    chart: {
      animation: false,
      plotBorderColor: "#ddd",
      plotBorderWidth: 1,
    },
    plotOptions: {
      column: {
        animation: false,
        pointPadding: 0,
        borderColor: "#4a4a4a",
        borderWidth: 0.1,
        shadow: false,
        minPointLength: 3,
      },
    },
    title: { text: title },
    time: {
      timezone: data.timezone,
      useUTC: undefined, // Important!
    },
    xAxis: {
      type: "datetime",
      gridLineColor: "#ddd",
      gridLineDashStyle: "Dash",
      gridLineWidth: 1,
      minorTicks: true,
      minorTickInterval: 3 * 3600 * 1000,
      minorGridLineColor: "#eee",
      minorGridLineDashStyle: "Dot",
      minorGridLineWidth: 1,
    },
    yAxis: {
      min: ymin,
      max: ymax,
      title: {
        text: "NowCast PM2.5 (\u00b5g/m\u00b3)",
      },
    },
    legend: {
      enabled: true,
      verticalAlign: "top",
    },
    series: [
      {
        name: "Hourly NowCast",
        type: "column",
        pointInterval: 3600 * 1000,
        pointStart: startTime.toMillis(),
        data: seriesData,
      },
    ],
  };
}

/**
 * Returns a Highcharts config for a small-multiples-style hourly NowCast barplot.
 * @param {Object} data Same structure as for hourlyBarplotConfig.
 */
export function small_hourlyBarplotConfig(data) {
  requireLuxonDateTimeArray(data.datetime, "datetime");

  const startTime = data.datetime[0];
  const ymin = 0;
  const ymax = pm25ToYMax(Math.max(...data.nowcast));

  const title = data.title ?? data.locationName;

  const seriesData = data.nowcast.map(v => ({
    y: v,
    color: pm25ToColor(v),
  }));

  return {
    accessibility: { enabled: false },
    chart: { animation: false },
    plotOptions: {
      column: {
        animation: false,
        pointPadding: 0,
        borderColor: "#4a4a4a",
        borderWidth: 0.1,
        shadow: false,
        minPointLength: 3,
      },
    },
    title: {
      text: title,
      style: { color: "#333333", fontSize: "12px" },
    },
    time: {
      timezone: data.timezone,
      useUTC: false,
    },
    xAxis: {
      type: "datetime",
      visible: false,
    },
    yAxis: {
      min: ymin,
      max: ymax,
      title: { text: "" },
    },
    legend: { enabled: false },
    series: [
      {
        name: "Hourly NowCast",
        type: "column",
        pointInterval: 3600 * 1000,
        pointStart: startTime.toMillis(),
        data: seriesData,
      },
    ],
  };
}
