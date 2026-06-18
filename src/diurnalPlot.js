// Luxon for timezone-aware datetime handling
import { DateTime } from "luxon";
// SunCalc for day-night shading
import SunCalc from "suncalc";
// Utility functions
import { pm25ToColor, pm25ToYMax, pm25_AQILines, validateDiurnalInputs } from "./plot-utils.js";

/**
 * Computes the derived series and chart values shared by `diurnalPlotConfig`
 * and `small_diurnalPlotConfig`. Assumes `data` has already passed
 * `validateDiurnalInputs()`.
 *
 * @param {Object} data - The diurnal plot data object (see `diurnalPlotConfig`).
 * @returns {Object} Derived values:
 *   `hour_average` (passthrough 7-day hourly mean),
 *   `yesterdayData` / `todayData` (color-encoded `{ y, color }` points),
 *   `sunriseHour` / `sunsetHour` (local fractional hours for the shading bands),
 *   `ymin` / `ymax` (y-axis bounds), and `chartTitle`.
 */
function prepareDiurnalData(data) {
  const { datetime, nowcast, locationName, timezone, title, longitude, latitude, hour_average } = data;

  // Align nowcast into yesterday/today windows based on the last local hour.
  const localHours = datetime.map(dt => dt.setZone(timezone).hour);
  const lastHour = localHours[localHours.length - 1];
  const today_end = localHours.length;
  const today_start = today_end - 1 - lastHour;
  const yesterday_end = today_start;
  const yesterday_start = today_start - 24;
  const yesterday = nowcast.slice(yesterday_start, yesterday_end);
  const today = nowcast.slice(today_start, today_end);

  // Sunrise/sunset for day-night shading, taken at the midpoint date.
  // Midpoint time (in Luxon UTC) → to JS Date in UTC
  const middleDatetime = datetime[Math.floor(datetime.length / 2)];
  const sunTimes = SunCalc.getTimes(middleDatetime.toJSDate(), latitude, longitude);
  const sunrise = DateTime.fromJSDate(sunTimes.sunrise, { zone: timezone });
  const sunset = DateTime.fromJSDate(sunTimes.sunset, { zone: timezone });
  const sunriseHour = sunrise.hour + sunrise.minute / 60;
  const sunsetHour = sunset.hour + sunset.minute / 60;

  // Color-encoded points
  const yesterdayData = yesterday.map(y => ({ y, color: pm25ToColor(y) }));
  const todayData = today.map(y => ({ y, color: pm25ToColor(y) }));

  return {
    hour_average,
    yesterdayData,
    todayData,
    sunriseHour,
    sunsetHour,
    ymin: 0,
    ymax: pm25ToYMax(Math.max(...hour_average, ...yesterday, ...today)),
    chartTitle: title ?? locationName,
  };
}

/**
 * Returns a diurnalPlot chart configuration.
 * @param {Object} data The data required to create the chart.
 * @param {DateTime[]} data.datetime - Array of Luxon DateTime objects in UTC.
 * @param {Array<number|null>} data.nowcast - NowCast values aligned with datetime.
 * @param {Array<number|null>} data.hour_average - 7-day mean by hour of day.
 * @param {number} data.latitude - Site latitude (for sunrise/sunset shading).
 * @param {number} data.longitude - Site longitude (for sunrise/sunset shading).
 * @param {string} data.locationName - Site or label name.
 * @param {string} data.timezone - IANA timezone string for local-hour alignment.
 * @param {string} [data.title] - Optional custom chart title.
 * @returns {Object} Highcharts chart config.
 */
export function diurnalPlotConfig(data) {
  validateDiurnalInputs(data);

  const {
    hour_average,
    yesterdayData,
    todayData,
    sunriseHour,
    sunsetHour,
    ymin,
    ymax,
    chartTitle,
  } = prepareDiurnalData(data);

  return {
    accessibility: { enabled: false },
    chart: {
      plotBorderColor: "#ddd",
      plotBorderWidth: 1,
    },
    plotOptions: {
      line: { animation: false },
    },
    tooltip: {
      shared: true,
      headerFormat: "{point.key}:00<br/>",
    },
    title: {
      text: chartTitle,
    },
    xAxis: {
      tickInterval: 3,
      labels: {
        formatter: function () {
          return {
            0: "Midnight",
            3: "3am",
            6: "6am",
            9: "9am",
            12: "Noon",
            15: "3pm",
            18: "6pm",
            21: "9pm"
          }[this.value] ?? this.value;
        }
      },
      plotBands: [
        { color: "rgb(0,0,0,0.1)", from: 0, to: sunriseHour },
        { color: "rgb(0,0,0,0.1)", from: sunsetHour, to: 24 }
      ]
    },
    yAxis: {
      min: ymin,
      max: ymax,
      gridLineColor: "#ddd",
      gridLineDashStyle: "Dash",
      gridLineWidth: 1,
      title: {
        text: "PM2.5 (µg/m³)",
      },
      plotLines: pm25_AQILines(2),
    },
    legend: {
      enabled: true,
      verticalAlign: "top",
    },
    series: [
      {
        name: "7 Day Mean",
        type: "line",
        data: hour_average,
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
}

/**
 * Returns a diurnalPlot chart configuration.
 * The 'small' version of this plot has no legend or axis labeling and is
 * appropriate for use in a display with "small multiples".
 * @param {Object} data The data required to create the chart. See
 *   `diurnalPlotConfig` for the full field list.
 * @returns {Object} Highcharts chart config.
 */
export function small_diurnalPlotConfig(data) {
  validateDiurnalInputs(data);

  const {
    hour_average,
    yesterdayData,
    todayData,
    sunriseHour,
    sunsetHour,
    ymin,
    ymax,
    chartTitle,
  } = prepareDiurnalData(data);

  return {
    accessibility: { enabled: false },
    chart: {
      animation: false,
    },
    plotOptions: {
      line: {
        animation: false,
      },
    },
    title: {
      text: chartTitle,
      style: { color: "#333333", fontSize: "12px" },
    },
    xAxis: {
      visible: true,
      tickLength: 0,
      labels: { enabled: false },
      plotBands: [
        { color: "rgb(0,0,0,0.1)", from: 0, to: sunriseHour },
        { color: "rgb(0,0,0,0.1)", from: sunsetHour, to: 24 }
      ]
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
        name: "7 Day Mean",
        type: "line",
        data: hour_average,
        color: "#aaa",
        lineWidth: 5,
        marker: { enabled: false },
      },
      {
        name: "Yesterday",
        type: "line",
        data: yesterdayData,
        color: "#888",
        lineWidth: 0.5,
        marker: {
          radius: 1.5,
          symbol: "circle",
          lineColor: "#888",
          lineWidth: 0.3,
        },
      },
      {
        name: "Today",
        type: "line",
        data: todayData,
        color: "#333",
        lineWidth: 1,
        marker: {
          radius: 2,
          symbol: "circle",
          lineColor: "#333",
          lineWidth: 0.5,
        },
      },
    ],
  };
}
