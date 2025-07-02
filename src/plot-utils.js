/**
 * Utilities for mapping PM2.5 values to Air Quality Categories (AQC),
 * AQI colors, y-axis limits, and visual elements in Highcharts plots.
 */

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

/**
 * 2024 NAAQS PM2.5 thresholds in µg/m³ for AQI categories.
 */
const AQI_THRESHOLDS = [0, 9, 35.4, 55.4, 125.4, 225.4];

/**
 * RGB colors corresponding to AQI categories 1 through 6.
 */
const AQI_COLORS = [
  "rgb(0,255,0)",      // Green
  "rgb(255,255,0)",    // Yellow
  "rgb(255,126,0)",    // Orange
  "rgb(255,0,0)",      // Red
  "rgb(143,63,151)",   // Purple
  "rgb(126,0,35)",     // Maroon
];

/**
 * Returns true if the given value is a finite number.
 * @param {*} value
 * @returns {boolean}
 */
function isValidPM25(value) {
  return typeof value === 'number' && isFinite(value);
}

// ------------------------------------------------------------------
// Core Utilities
// ------------------------------------------------------------------

/**
 * Returns the Air Quality Category (AQC) level associated with a PM2.5 measurement.
 * Categories range from 1 (Good) to 6 (Hazardous).
 *
 * @param {number} pm25 - PM2.5 concentration in µg/m³.
 * @returns {number|null} AQC level (1–6), or null if input is invalid.
 */
export function pm25ToAQC(pm25) {
  if (!isValidPM25(pm25)) return null;

  if (pm25 <= 9) return 1;
  if (pm25 <= 35.4) return 2;
  if (pm25 <= 55.4) return 3;
  if (pm25 <= 125.4) return 4;
  if (pm25 <= 225.4) return 5;
  return 6;
}

/**
 * Returns the AQI color associated with a PM2.5 level.
 *
 * @param {number} pm25 - PM2.5 concentration in µg/m³.
 * @returns {string} RGB color string.
 */
export function pm25ToColor(pm25) {
  const AQC = pm25ToAQC(pm25);
  return AQC == null ? "rgb(187,187,187)" : AQI_COLORS[AQC - 1];
}

/**
 * Returns the ymax value appropriate for a maximum PM2.5 level.
 * Uses fixed breakpoints to prevent charts from autoscaling too wildly.
 *
 * @param {number} pm25 - Maximum PM2.5 value in µg/m³.
 * @returns {number} Suggested y-axis maximum.
 */
export function pm25ToYMax(pm25) {
  if (!isValidPM25(pm25)) return 50;

  if (pm25 <= 50) return 50;
  if (pm25 <= 100) return 100;
  if (pm25 <= 200) return 200;
  if (pm25 <= 400) return 500;
  if (pm25 <= 600) return 600;
  if (pm25 <= 1000) return 1000;
  if (pm25 <= 1500) return 1500;

  return 1.05 * pm25;
}

/**
 * Returns an array of plotLine objects for overlaying AQI thresholds on a Highcharts yAxis.
 *
 * @param {number} [width=2] - Line width in pixels.
 * @returns {Array<Object>} Highcharts-compatible `plotLines` array.
 */
export function pm25_AQILines(width = 2) {
  return AQI_THRESHOLDS.slice(1).map((value, i) => ({
    color: AQI_COLORS[i + 1], // start from yellow
    width,
    value,
  }));
}

/**
 * Adds a colored AQI stacked bar to the left side of an existing Highcharts chart.
 * Intended to provide a visual reference for AQI zones.
 *
 * @param {Highcharts.Chart} chart - A fully rendered Highcharts chart.
 * @param {number} [width=6] - Width of the AQI bar in pixels.
 */
export function pm25_addAQIStackedBar(chart, width = 6) {
  if (!chart?.xAxis?.[0] || !chart?.yAxis?.[0] || !chart?.renderer) {
    console.warn("Invalid chart object passed to pm25_addAQIStackedBar.");
    return;
  }

  width = Math.max(1, Number(width) || 6);

  const yAxis = chart.yAxis[0];
  const xlo = chart.xAxis[0].left;
  const ymax_px = yAxis.toPixels(yAxis.max);

  for (let i = 0; i < AQI_THRESHOLDS.length - 1; i++) {
    const yhi = yAxis.toPixels(AQI_THRESHOLDS[i]);
    const nextThreshold = AQI_THRESHOLDS[i + 1] ?? 5000;
    if (yhi > ymax_px) {
      const ylo = Math.max(yAxis.toPixels(nextThreshold), ymax_px);
      const height = Math.abs(yhi - ylo);
      chart.renderer
        .rect(xlo, ylo, width, height, 1)
        .attr({ fill: AQI_COLORS[i], stroke: "transparent" })
        .add();
    }
  }
}

/**
 * Validate the input data arrays for hourly or time series plots.
 *
 * @param {Date[]} datetime - Array of JavaScript Date objects in UTC.
 * @param {(number|null)[]} pm25 - Array of PM2.5 values (finite or null).
 * @param {(number|null)[]} nowcast - Array of NowCast values (finite or null).
 * @throws {Error} If input is invalid in structure or type.
 */
export function validatePlotArrays(datetime, pm25, nowcast) {
  // Presence check
  if (!Array.isArray(datetime) || !Array.isArray(pm25) || !Array.isArray(nowcast)) {
    throw new Error("Input arrays must be defined and of type Array");
  }

  // Length check
  const len = datetime.length;
  if (pm25.length !== len || nowcast.length !== len) {
    throw new Error(`All arrays must have the same length. Got: datetime(${len}), pm25(${pm25.length}), nowcast(${nowcast.length})`);
  }

  // Datetime: must be Date objects and in UTC
  for (let i = 0; i < len; i++) {
    const d = datetime[i];
    if (!(d instanceof Date) || isNaN(d.getTime())) {
      throw new Error(`Invalid datetime at index ${i}: expected Date object, got ${d}`);
    }
    if (d.getTimezoneOffset() !== 0) {
      throw new Error(`Datetime at index ${i} is not in UTC: offset=${d.getTimezoneOffset()} minutes`);
    }
  }

  // Check if datetimes are increasing
  let warned = false;
  for (let i = 1; i < len; i++) {
    if (datetime[i].getTime() <= datetime[i - 1].getTime()) {
      if (!warned) {
        console.warn("⚠️ Warning: datetime array is not strictly increasing");
        warned = true;
      }
      console.warn(`↳ Non-increasing at index ${i - 1} → ${i}: ${datetime[i - 1].toISOString()} >= ${datetime[i].toISOString()}`);
    }
  }

  // pm25 and nowcast must be finite numbers or null
  const isValidValue = (v) => v === null || (typeof v === "number" && isFinite(v));
  for (let i = 0; i < len; i++) {
    if (!isValidValue(pm25[i])) {
      throw new Error(`Invalid pm25 value at index ${i}: ${pm25[i]}`);
    }
    if (!isValidValue(nowcast[i])) {
      throw new Error(`Invalid nowcast value at index ${i}: ${nowcast[i]}`);
    }
  }
}
