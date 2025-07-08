// Utility functions
import { pm25ToColor, pm25ToYMax, pm25_AQILines } from "./plot-utils.js";
import { requireLuxonDateTimeArray } from "./helpers.js";

/**
 * Returns a dailyRangeBarplot chart configuration.
 * @param {Object} data
 * @param {DateTime[]} data.daily_datetime - Luxon DateTime[] in UTC.
 * @param {number[]} data.daily_min - Daily PM2.5 minimum values.
 * @param {number[]} data.daily_mean - Daily PM2.5 mean values.
 * @param {number[]} data.daily_max - Daily PM2.5 maximum values.
 * @param {string} data.locationName - Label for chart title.
 * @param {string} data.timezone - IANA time zone string (e.g. "America/Los_Angeles").
 * @param {string} [data.title] - Optional override for chart title.
 */
export function dailyRangeBarplotConfig(data) {
  requireLuxonDateTimeArray(data.daily_datetime, "daily_datetime");

  const title = data.title ?? data.locationName;
  const ymin = 0;
  const ymax = pm25ToYMax(Math.max(...data.daily_mean));

  const categories = data.daily_datetime.map(dt =>
    dt.setZone(data.timezone).toFormat("MMM dd")
  );

  const dailyMean = data.daily_mean.map(v => ({
    y: v,
    color: pm25ToColor(v)
  }));

  const dailyRange = data.daily_datetime.map((_, i) => [
    data.daily_min[i],
    data.daily_max[i]
  ]);

  return {
    accessibility: { enabled: false },
    chart: {
      plotBorderColor: "#ddd",
      plotBorderWidth: 1
    },
    plotOptions: {
      columnrange: { animation: false }
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
        name: "Daily Range",
        type: "columnrange",
        data: dailyRange,
        color: "#bbb"
      },
      {
        name: "Daily Mean",
        type: "scatter",
        data: dailyMean,
        animation: false,
        marker: {
          radius: 3,
          symbol: "circle",
          lineColor: "#333",
          lineWidth: 0.5
        }
      }
    ]
  };
}

/**
 * Returns a compact dailyRangeBarplot config for use in small-multiples display.
 * @param {Object} data See `dailyRangeBarplotConfig` for structure.
 */
export function small_dailyRangeBarplotConfig(data) {
  requireLuxonDateTimeArray(data.daily_datetime, "daily_datetime");

  const title = data.title ?? data.locationName;
  const ymin = 0;
  const ymax = pm25ToYMax(Math.max(...data.daily_mean));

  const categories = data.daily_datetime.map(dt =>
    dt.setZone(data.timezone).toFormat("MMM dd")
  );

  const dailyMean = data.daily_mean.map(v => ({
    y: v,
    color: pm25ToColor(v)
  }));

  const dailyRange = data.daily_datetime.map((_, i) => [
    data.daily_min[i],
    data.daily_max[i]
  ]);

  return {
    accessibility: { enabled: false },
    chart: { animation: false },
    plotOptions: {
      columnrange: { animation: false }
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
      plotLines: pm25_AQILines(2)
    },
    legend: { enabled: false },
    series: [
      {
        name: "Daily Range",
        type: "columnrange",
        data: dailyRange,
        color: "#bbb"
      },
      {
        name: "Daily Mean",
        type: "scatter",
        data: dailyMean,
        animation: false,
        marker: {
          radius: 2,
          symbol: "circle",
          lineColor: "#333",
          lineWidth: 0.5
        }
      }
    ]
  };
}
