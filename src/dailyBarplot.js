// moment for timezone-aware date handling
import moment from "moment-timezone";

// Utility functions
import { pm25ToColor, pm25ToYMax, pm25_AQILines } from "./plot-utils.js";

/**
 * Returns a dailyBarplot chart configuration.
 * @param {Object} data The data required to create the chart.
 */
export function dailyBarplotConfig(
  data = {
    daily_datetime,
    daily_mean,
    daily_nowcast,
    locationName,
    timezone,
    title,
  }
) {
  // ----- Data preparation --------------------------------

  // Create colored series data
  // See:  https://stackoverflow.com/questions/35854947/how-do-i-change-a-specific-bar-color-in-highcharts-bar-chart

  // NOTE:  If the chart width specified in the component html is too small,
  // NOTE:  large symbols that would bump into each other will not be drawn.
  let seriesData = [];
  for (let i = 0; i < data.daily_mean.length; i++) {
    seriesData[i] = {
      y: data.daily_mean[i],
      color: pm25ToColor(data.daily_mean[i]),
    };
  }

  let days = data.daily_datetime.map((x) =>
    moment.tz(x, data.timezone).format("MMM DD")
  );

  // Default to well defined y-axis limits for visual stability
  let ymin = 0;
  let ymax = pm25ToYMax(Math.max(...data.daily_mean));

  let title = data.title;
  if (data.title === undefined) {
    title = data.locationName;
  }
  // ----- Chart configuration --------------------------------

  let chartConfig = {
    accessibility: { enabled: false },
    chart: {
      plotBorderColor: "#ddd",
      plotBorderWidth: 1,
    },
    plotOptions: {
      column: {
        animation: false,
        allowPointSelect: true,
        borderColor: "#666",
        borderWidth: 1,
      },
    },
    title: {
      text: title,
    },
    xAxis: {
      categories: days,
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
        name: "Daily Average PM2.5",
        type: "column",
        data: seriesData,
      },
    ],
  };

  return chartConfig;
}

/**
 * Returns a dailyBarplot chart configuration.
 * The 'small' version of this plot has no legend or axis labeling and is
 * appropriate for use in a display with "small multiples".
 * @param {Object} data The data required to create the chart.
 */
export function small_dailyBarplotConfig(
  data = {
    daily_datetime,
    daily_mean,
    daily_nowcast,
    locationName,
    timezone,
    title,
  }
) {
  // ----- Data preparation --------------------------------

  // Create colored series data
  // See:  https://stackoverflow.com/questions/35854947/how-do-i-change-a-specific-bar-color-in-highcharts-bar-chart

  // NOTE:  If the chart width specified in the component html  is too small,
  // NOTE:  large symbols that would bump into each other will not be drawn.
  let seriesData = [];
  for (let i = 0; i < data.daily_mean.length; i++) {
    seriesData[i] = {
      y: data.daily_mean[i],
      color: pm25ToColor(data.daily_mean[i]),
    };
  }

  let days = data.daily_datetime.map((x) =>
    moment.tz(x, data.timezone).format("MMM DD")
  );

  // Default to well defined y-axis limits for visual stability
  let ymin = 0;
  let ymax = pm25ToYMax(Math.max(...data.daily_mean));

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
      column: {
        animation: false,
        allowPointSelect: true,
        borderColor: "#666",
        borderWidth: 0.5,
      },
    },
    title: {
      text: title,
      style: { color: "#333333", fontSize: "12px" },
    },
    xAxis: {
      categories: days,
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
        name: "Daily Average PM2.5",
        type: "column",
        data: seriesData,
      },
    ],
  };

  return chartConfig;
}
