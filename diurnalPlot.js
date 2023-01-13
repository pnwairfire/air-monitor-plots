// moment for timezone-aware date handling
import moment from "moment-timezone";

// SunCalc for day-night shading
import SunCalc from "suncalc";

// Utility functions
import { pm25ToColor, pm25ToYMax } from "./plot-utils.js";

/**
 * Returns a diurnalPlot chart configuration.
 * @param {Object} data The data required to create the chart.
 */
export function diurnalPlotConfig(
  data = {
    hour,
    hour_mean,
    yesterday,
    today,
    locationName,
    timezone,
    sunriseHour,
    sunsetHour,
    title,
  }
) {
  // ----- Data preparation --------------------------------

  // Default to well defined y-axis limits for visual stability
  let ymin = 0;
  let ymax = pm25ToYMax(
    Math.max(...data.hour_mean, ...data.yesterday, ...data.today)
  );

  let title = data.title;
  if (data.title === undefined) {
    title = data.locationName;
  }

  // Create colored series data
  // See:  https://stackoverflow.com/questions/35854947/how-do-i-change-a-specific-bar-color-in-highcharts-bar-chart

  // NOTE:  If the chart width specified in the component html  is too small,
  // NOTE:  large symbols that would bump into each other will not be drawn.
  let yesterdayData = [];
  for (let i = 0; i < data.yesterday.length; i++) {
    yesterdayData[i] = {
      y: data.yesterday[i],
      color: pm25ToColor(data.yesterday[i]),
    };
  }
  let todayData = [];
  for (let i = 0; i < data.today.length; i++) {
    todayData[i] = { y: data.today[i], color: pm25ToColor(data.today[i]) };
  }

  // ----- Chart configuration --------------------------------

  let chartConfig = {
    accessibility: { enabled: false },
    chart: {
      plotBorderColor: "#ddd",
      plotBorderWidth: 1,
    },
    plotOptions: {
      line: {
        animation: false,
      },
    },
    title: {
      text: title,
    },
    xAxis: {
      tickInterval: 3,
      labels: {
        formatter: function () {
          var label = this.axis.defaultLabelFormatter.call(this);
          label =
            label == "0"
              ? "Midnight"
              : label == "3"
              ? "3am"
              : label == "6"
              ? "6am"
              : label == "9"
              ? "9am"
              : label == "12"
              ? "Noon"
              : label == "15"
              ? "3pm"
              : label == "18"
              ? "5pm"
              : label == "21"
              ? "9pm"
              : label;
          return label;
        },
      },
      plotBands: [
        { color: "rgb(0,0,0,0.1)", from: 0, to: data.sunriseHour },
        { color: "rgb(0,0,0,0.1)", from: data.sunsetHour, to: 24 },
      ],
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
        name: "7 Day Mean",
        type: "line",
        data: data.hour_mean,
        color: "#aaa",
        lineWidth: 10,
        marker: { radius: 1, symbol: "square", fillColor: "transparent" },
      },
      {
        name: "Yesterday",
        type: "line",
        data: yesterdayData,
        color: "#888",
        lineWidth: 1,
        marker: {
          radius: 3,
          symbol: "circle",
          lineColor: "#888",
          lineWidth: 1,
        },
      },
      {
        name: "Today",
        type: "line",
        data: todayData,
        color: "#333",
        lineWidth: 2,
        marker: {
          radius: 5,
          symbol: "circle",
          lineColor: "#333",
          lineWidth: 1,
        },
      },
    ],
  };

  return chartConfig;
}
