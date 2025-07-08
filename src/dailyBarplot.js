// Utility functions
import { pm25ToColor, pm25ToYMax, pm25_AQILines } from "./plot-utils.js";
import { requireLuxonDateTimeArray } from "./helpers.js";

/**
 * Returns a daily barplot chart configuration.
 * @param {Object} data
 * @param {DateTime[]} data.daily_datetime - Luxon DateTime[] in UTC.
 * @param {number[]} data.daily_mean - Daily PM2.5 mean values.
 * @param {string} data.locationName - Label for chart title.
 * @param {string} data.timezone - IANA time zone string.
 * @param {string} [data.title] - Optional custom title.
 */
export function dailyBarplotConfig(data) {
  requireLuxonDateTimeArray(data.daily_datetime, "daily_datetime");

  const title = data.title ?? data.locationName;
  const ymin = 0;
  const ymax = pm25ToYMax(Math.max(...data.daily_mean));

  const categories = data.daily_datetime.map(dt =>
    dt.setZone(data.timezone).toFormat("MMM dd")
  );

  const seriesData = data.daily_mean.map(value => ({
    y: value,
    color: pm25ToColor(value)
  }));

  return {
    accessibility: { enabled: false },
    chart: {
      plotBorderColor: "#ddd",
      plotBorderWidth: 1
    },
    plotOptions: {
      column: {
        animation: false,
        borderColor: "#666",
        borderWidth: 1
      }
    },
    title: { text: title },
    xAxis: {
      categories
    },
    yAxis: {
      min: ymin,
      max: ymax,
      gridLineColor: "#ddd",
      gridLineDashStyle: "Dash",
      gridLineWidth: 1,
      title: { text: "PM2.5 (\u00b5g/m\u00b3)" },
      plotLines: pm25_AQILines(2)
    },
    legend: {
      enabled: true,
      verticalAlign: "top"
    },
    series: [
      {
        name: "Daily Average PM2.5",
        type: "column",
        data: seriesData
      }
    ]
  };
}

/**
 * Returns a daily barplot chart configuration for small-multiples display.
 * @param {Object} data Same structure as `dailyBarplotConfig`.
 */
export function small_dailyBarplotConfig(data) {
  requireLuxonDateTimeArray(data.daily_datetime, "daily_datetime");

  const title = data.title ?? data.locationName;
  const ymin = 0;
  const ymax = pm25ToYMax(Math.max(...data.daily_mean));

  const categories = data.daily_datetime.map(dt =>
    dt.setZone(data.timezone).toFormat("MMM dd")
  );

  const seriesData = data.daily_mean.map(value => ({
    y: value,
    color: pm25ToColor(value)
  }));

  return {
    accessibility: { enabled: false },
    chart: {
      animation: false
    },
    plotOptions: {
      column: {
        animation: false,
        borderColor: "#666",
        borderWidth: 0.5
      }
    },
    title: {
      text: title,
      style: { color: "#333333", fontSize: "12px" }
    },
    xAxis: {
      categories,
      visible: false
    },
    yAxis: {
      min: ymin,
      max: ymax,
      title: { text: "" },
      plotLines: pm25_AQILines(1)
    },
    legend: { enabled: false },
    series: [
      {
        name: "Daily Average PM2.5",
        type: "column",
        data: seriesData
      }
    ]
  };
}
