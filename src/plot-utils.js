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
      : pm25 <= 150.5
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

/**
 * Returns an array of objects with {color, width, value} properties. These
 * can be used to add colored AQI lines to plots with a PM2.5 axis measured
 * in micrograms per meter cubed.
 *
 * Usage in a Highcharts configuration:
 * ```
 * yaxis: {
 *   plotlines: pm25_AQILines(),
 * }
 * ```
 * @param {number} width Line width in pixels.
 */
export function pm25_AQILines(width = 2) {
  let lines = [
    { color: "rgb(255,255,0)", width: width, value: 12 },
    { color: "rgb(255,126,0)", width: width, value: 35.5 },
    { color: "rgb(255,0,0)", width: width, value: 55.5 },
    { color: "rgb(143,63,151)", width: width, value: 150.5 },
    { color: "rgb(126,0,35)", width: width, value: 250.5 },
  ];
  return lines;
}

/**
 * Draws a stacked bar indicating pm25 AQI levels on the left side of a chart.
 * The chart must already exist. This is not part of chart configuration.
 * @param {Highcharts.chart} chart
 */
export function pm25_addAQIStackedBar(chart, width = 6) {
  // NOTE:  0, 0 is at the top left of the graphic with y increasing downward

  let xmin = chart.xAxis[0].min;
  let ymin = chart.yAxis[0].min;
  let ymax = chart.yAxis[0].max;
  let ymax_px = chart.yAxis[0].toPixels(ymax);

  let xlo = chart.xAxis[0].left; // leftmost pixel of the plot area
  // let xhi = xlo + 8;
  // let width = Math.abs(xhi - xlo);

  // Green
  let yhi = chart.yAxis[0].toPixels(0);
  let ylo = Math.max(chart.yAxis[0].toPixels(12), ymax_px);
  let height = Math.abs(yhi - ylo);
  chart.renderer
    .rect(xlo, ylo, width, height, 1)
    .attr({ fill: "rgb(0,255,0)", stroke: "transparent" })
    .add();

  // Yellow
  yhi = chart.yAxis[0].toPixels(12);
  if (yhi > ymax_px) {
    ylo = Math.max(chart.yAxis[0].toPixels(35.5), ymax_px);
    height = Math.abs(yhi - ylo);
    chart.renderer
      .rect(xlo, ylo, width, height, 1)
      .attr({ fill: "rgb(255,255,0)", stroke: "transparent" })
      .add();
  }

  // Orange
  yhi = chart.yAxis[0].toPixels(35.5);
  if (yhi > ymax_px) {
    ylo = Math.max(chart.yAxis[0].toPixels(55.5), ymax_px);
    height = Math.abs(yhi - ylo);
    chart.renderer
      .rect(xlo, ylo, width, height, 1)
      .attr({ fill: "rgb(255,126,0)", stroke: "transparent" })
      .add();
  }

  // Red
  yhi = chart.yAxis[0].toPixels(55.5);
  if (yhi > ymax_px) {
    ylo = Math.max(chart.yAxis[0].toPixels(150.5), ymax_px);
    height = Math.abs(yhi - ylo);
    chart.renderer
      .rect(xlo, ylo, width, height, 1)
      .attr({ fill: "rgb(255,0,0)", stroke: "transparent" })
      .add();
  }

  // Purple
  yhi = chart.yAxis[0].toPixels(150.5);
  if (yhi > ymax_px) {
    ylo = Math.max(chart.yAxis[0].toPixels(250), ymax_px);
    height = Math.abs(yhi - ylo);
    chart.renderer
      .rect(xlo, ylo, width, height, 1)
      .attr({ fill: "rgb(143,63,151)", stroke: "transparent" })
      .add();
  }

  // Maroon
  yhi = chart.yAxis[0].toPixels(250);
  if (yhi > ymax_px) {
    ylo = Math.max(chart.yAxis[0].toPixels(5000), ymax_px);
    height = Math.abs(yhi - ylo);
    chart.renderer
      .rect(xlo, ylo, width, height, 1)
      .attr({ fill: "rgb(126,0,35)", stroke: "transparent" })
      .add();
  }
}
