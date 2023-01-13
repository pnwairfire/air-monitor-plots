// moment for timezone-aware date handling
import moment from "moment-timezone";

// Utility functions
import { pm25ToColor, pm25ToYMax } from "./plot-utils.js";

/**
 * Returns a dailyBarplot chart configuration.
 * @param {Object} data The data required to create the chart.
 */
export function dailyBarplotConfig(
  data = {
    daily_datetime,
    daily_pm25,
    daily_nowcast,
    locationName,
    timezone,
    title,
  }
) {
  // ----- Data preparation --------------------------------

  // Default to well defined y-axis limits for visual stability
  let ymin = 0;
  let ymax = pm25ToYMax(Math.max(...data.daily_pm25));

  let title = data.title;
  if (data.title === undefined) {
    title = data.locationName;
  }

  // Create colored series data
  // See:  https://stackoverflow.com/questions/35854947/how-do-i-change-a-specific-bar-color-in-highcharts-bar-chart

  // NOTE:  If the chart width specified in the component html  is too small,
  // NOTE:  large symbols that would bump into each other will not be drawn.
  let seriesData = [];
  for (let i = 0; i < data.daily_pm25.length; i++) {
    seriesData[i] = {
      y: data.daily_pm25[i],
      color: pm25ToColor(data.daily_pm25[i]),
    };
  }

  let days = data.daily_datetime.map((x) =>
    moment.tz(x, data.timezone).format("MMM DD")
  );

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
      //plotLines: this.AQI_pm25_lines // horizontal colored lines
    },
    legend: {
      enabled: true,
      verticalAlign: "top",
    },
    series: [
      {
        name: "Daily Avg PM2.5",
        type: "column",
        data: seriesData,
      },
    ],
  };

  return chartConfig;
}
