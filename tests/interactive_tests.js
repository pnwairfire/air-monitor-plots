// Test that we can generate a chartConfig.
import { timeseriesPlotConfig } from "../src/index.js";
import { hourlyBarplotConfig } from "../src/index.js";

let hour = 1000 * 60 * 60; // milliseconds per hour
let now = new Date();
var endDate = new Date(Math.round(now.getTime() / hour) * hour);

let datetime = [1, 2, 3, 4, 5, 6].reverse().map((o) => {
  return new Date(endDate - o * hour);
});

let plotData;
let chartConfig;

plotData = {
  datetime: datetime,
  pm25: [1, 4, 2, 5, 3, 6],
  nowcast: [1, 3, 3, 4, 4, 5],
  locationName: "my location",
  timezone: "America/Los_Angeles",
  title: undefined, // use default title
};

chartConfig = timeseriesPlotConfig(plotData);
// chartConfig = hourlyBarplotConfig(plotData);

console.log(chartConfig);

// plotData = {
//   daily_datetime: datetime,
//   daily_min: [1, 2, 1, 1, 3, 2],
//   daily_mean: [1, 4, 2, 5, 3, 6],
//   daily_max: [1.5, 6, 3, 9, 2, 10],
//   locationName: "my location",
//   timezone: "America/Los_Angeles",
//   title: undefined, // use default title
// };

// chartConfig = dailyBarplotConfig(plotData);

// console.log(chartConfig);
