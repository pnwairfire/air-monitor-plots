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
    datetime,
    pm25,
    nowcast,
    locationName,
    timezone,
    title,
    // unique to this chart
    longitude,
    latitude,
    // hour,
    hour_mean,
  }
) {
  // ----- Data preparation --------------------------------

  // Calculate yesterday/today start/end
  const localHours = data.datetime.map((o) =>
    moment.tz(o, data.timezone).hours()
  );
  const lastHour = localHours[localHours.length - 1];
  const today_end = localHours.length;
  const today_start = localHours.length - 1 - lastHour;
  const yesterday_end = today_start;
  const yesterday_start = today_start - 24;
  const yesterday = nowcast.slice(yesterday_start, yesterday_end);
  const today = nowcast.slice(today_start, today_end);

  // Calculate day/night shading times
  const middleDatetime = data / datetime[Math.round(data.datetime.length / 2)];
  const times = SunCalc.getTimes(
    middleDatetime.valueOf(),
    data.latitude,
    data.longitude
  );
  const sunriseHour =
    moment.tz(times.sunrise, data.timezone).hour() +
    moment.tz(times.sunrise, data.timezone).minute() / 60;
  const sunsetHour =
    moment.tz(times.sunset, data.timezone).hour() +
    moment.tz(times.sunset, data.timezone).minute() / 60;

  // Create colored series data
  // See:  https://stackoverflow.com/questions/35854947/how-do-i-change-a-specific-bar-color-in-highcharts-bar-chart

  // NOTE:  If the chart width specified in the component html  is too small,
  // NOTE:  large symbols that would bump into each other will not be drawn.
  let yesterdayData = [];
  for (let i = 0; i < yesterday.length; i++) {
    yesterdayData[i] = {
      y: yesterday[i],
      color: pm25ToColor(yesterday[i]),
    };
  }
  let todayData = [];
  for (let i = 0; i < today.length; i++) {
    todayData[i] = { y: today[i], color: pm25ToColor(today[i]) };
  }

  // Default to well defined y-axis limits for visual stability
  let ymin = 0;
  let ymax = pm25ToYMax(Math.max(...data.hour_mean, ...yesterday, ...today));

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
        { color: "rgb(0,0,0,0.1)", from: 0, to: sunriseHour },
        { color: "rgb(0,0,0,0.1)", from: sunsetHour, to: 24 },
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
