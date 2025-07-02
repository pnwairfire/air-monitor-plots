// moment for timezone-aware date handling
import moment from "moment-timezone";

// Utility functions
import { pm25ToYMax, pm25ToColor, pm25_AQILines } from "./plot-utils.js";

/**
 * Returns a timeseriesPlot chart configuration.
 * @param {Object} data The data required to create the chart.
 */
export function hourlyBarplotConfig(
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

  // NOTE:  If the chart width specified in the component html is too small,
  // NOTE:  large symbols that would bump into each other will not be drawn.
  let seriesData = [];
  for (let i = 0; i < data.nowcast.length; i++) {
    seriesData[i] = {
      y: data.nowcast[i],
      color: pm25ToColor(data.nowcast[i]),
    };
  }

  let startTime = data.datetime[0];
  // let xAxis_title = 'Time (${data.timezone})';

  // Default to well defined y-axis limits for visual stability
  let ymin = 0;
  let ymax = pm25ToYMax(Math.max(...data.nowcast));

  const title = data.title ?? data.locationName;

  // ----- Chart configuration --------------------------------

  let chartConfig = {
    accessibility: { enabled: false },
    chart: {
      animation: false,
      plotBorderColor: "#ddd",
      plotBorderWidth: 1,
    },
    plotOptions: {
      column: {
        animation: false,
        allowPointSelect: true,
        pointPadding: 0,
        borderColor: "#4a4a4a",
        borderWidth: 0.1,
        shadow: false,
        minPointLength: 3,
      },
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
      title: {
        text: "NowCast PM2.5 (\u00b5g/m\u00b3)",
      },
      // plotLines: pm25_AQILines(2), // removed as default per Sim Larkin request
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
        pointStart: startTime.valueOf(), // milliseconds
        data: seriesData,
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
export function small_hourlyBarplotConfig(
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

  // NOTE:  If the chart width specified in the component html is too small,
  // NOTE:  large symbols that would bump into each other will not be drawn.
  let seriesData = [];
  for (let i = 0; i < data.nowcast.length; i++) {
    seriesData[i] = {
      y: data.nowcast[i],
      color: pm25ToColor(data.nowcast[i]),
    };
  }

  let startTime = data.datetime[0];
  // let xAxis_title = 'Time (${data.timezone})';

  // Default to well defined y-axis limits for visual stability
  let ymin = 0;
  let ymax = pm25ToYMax(Math.max(...data.nowcast));

  const title = data.title ?? data.locationName;

  // ----- Chart configuration --------------------------------

  let chartConfig = {
    accessibility: { enabled: false },
    chart: {
      animation: false,
    },
    plotOptions: {
      column: {
        animation: false,
        allowPointSelect: true,
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
      // plotLines: pm25_AQILines(1), // removed as default per Sim Larkin request
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        name: "Hourly NowCast",
        type: "column",
        pointInterval: 3600 * 1000,
        pointStart: startTime.valueOf(), // milliseconds
        data: seriesData,
      },
    ],
  };

  return chartConfig;
}
