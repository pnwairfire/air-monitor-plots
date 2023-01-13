/**
 * Returns the AQI color associated with a PM2.5 level.
 * @param {number} pm25 PM2.5 value in ug/m3.
 */
export function pm25ToColor(pm25) {
  let color =
    pm25 <= 12
      ? "rgb(0,255,0)"
      : pm25 <= 35.5
      ? "rgb(255,255,0)"
      : pm25 <= 55.5
      ? "rgb(255,126,0)"
      : pm25 <= 105.5
      ? "rgb(255,0,0)"
      : pm25 <= 250
      ? "rgb(143,63,151)"
      : "rgb(126,0,35)";

  return color;
}

/**
 * Returns the ymax value appropriate for a maximum PM2.5 level.
 * Having a finite set of ymax values prevents the y-scale from jumping around too much.
 * @param {number} pm25 Maximum PM2.5 value in ug/m3.
 */
export function pm25ToYMax(pm25) {
  // See:  https://github.com/MazamaScience/AirMonitorPlots/blob/5482843e8e0ccfe1e30ccf21509d0df01fe45bca/R/custom_pm25TimeseriesScales.R#L103
  let ymax =
    pm25 <= 50
      ? 50
      : pm25 <= 100
      ? 100
      : pm25 <= 200
      ? 200
      : pm25 <= 400
      ? 500
      : pm25 <= 600
      ? 600
      : pm25 <= 1000
      ? 1000
      : pm25 <= 1500
      ? 1500
      : 1.05 * pm25;

  return ymax;
}
