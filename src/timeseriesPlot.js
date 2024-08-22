// moment for timezone-aware date handling
import moment from "moment-timezone";

// Utility functions
import { pm25ToYMax, pm25_AQILines } from "./plot-utils.js";

/**
 * Returns a timeseriesPlot chart configuration.
 * @param {Object} data The data required to create the chart.
 */
export function timeseriesPlotConfig(
  data = {
    datetime,
    pm25,
    nowcast,
    locationName,
    timezone,
    title,
  }
) {
  // ----- Data preparation --------------------------------

  let startTime = data.datetime[0];
  // let xAxis_title = 'Time (${data.timezone})';

  // Default to well defined y-axis limits for visual stability
  let ymin = 0;
  let ymax = pm25ToYMax(Math.max(...data.pm25));

  let title = data.title;
  if (data.title === undefined) {
    title = data.locationName;
  }

  // ----- Chart configuration --------------------------------

  let chartConfig = {
    accessibility: { enabled: false },
    chart: {
      animation: false,
      plotBorderColor: "#ddd",
      plotBorderWidth: 1,
    },
    plotOptions: {
      series: {
        animation: false,
      },
    },
    tooltip: {
      shared: true,
    },
    title: {
      text: title,
    },
    time: {
      timezone: data.timezone,
      useUTC: true,
    },
    xAxis: {
      type: "datetime",
      // title: {margin: 20, style: { "color": "#333", "fontSize": "16px" }, text: xAxis_title},
      gridLineColor: "#ddd",
      gridLineDashStyle: "Dash",
      gridLineWidth: 1,
      minorTicks: true,
      minorTickInterval: 3 * 3600 * 1000, // every 3 hrs
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
        pointStart: startTime.valueOf(), // milliseconds
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
        pointStart: startTime.valueOf(), // milliseconds
        data: data.nowcast,
        color: "#000",
        marker: { radius: 1, symbol: "square", fillColor: "transparent" },
      },
    ],
  };

  return chartConfig;
}

/**
 * Returns a timeseriesPlot chart configuration.
 * The 'small' version of this plot has no legend or axis labeling and is
 * appropriate for use in a display with "small multiples".
 * @param {Object} data The data required to create the chart.
 */
export function small_timeseriesPlotConfig(
  data = {
    datetime,
    pm25,
    nowcast,
    locationName,
    timezone,
    title,
  }
) {
  // ----- Data preparation --------------------------------

  let startTime = data.datetime[0];
  // let xAxis_title = 'Time (${data.timezone})';

  // Default to well defined y-axis limits for visual stability
  let ymin = 0;
  let ymax = pm25ToYMax(Math.max(...data.pm25));

  let title = data.title;
  if (data.title === undefined) {
    title = data.locationName;
  }

  // ----- Chart configuration --------------------------------

  let chartConfig = {
    accessibility: { enabled: false },
    chart: {
      animation: false,
    },
    plotOptions: {
      series: {
        animation: false,
      },
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
      title: {
        text: "",
      },
      plotLines: pm25_AQILines(1),
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        name: "Hourly PM2.5 Values",
        type: "scatter",
        pointInterval: 3600 * 1000,
        pointStart: startTime.valueOf(), // milliseconds
        data: data.pm25,
      },
      {
        name: "Nowcast",
        type: "line",
        lineWidth: 1,
        pointInterval: 3600 * 1000,
        pointStart: startTime.valueOf(), // milliseconds
        data: data.nowcast,
      },
    ],
  };

  return chartConfig;
}
