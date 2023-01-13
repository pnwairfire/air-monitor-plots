// Test that we can generate a chartConfig.
import { timeseriesPlotConfig } from "./index.js";

let hour = 1000 * 60 * 60; // milliseconds per hour
let now = new Date();
var endDate = new Date(Math.round(now.getTime() / hour) * hour);

let datetime = [1, 2, 3, 4, 5, 6].reverse().map((o) => {
  return new Date(endDate - o * hour);
});

const plotData = {
  datetime: datetime,
  pm25: [1, 4, 2, 5, 3, 6],
  nowcast: [1, 3, 3, 4, 4, 5],
  locationName: "my location",
  timezone: "America/Los_Angeles",
  title: undefined, // use default title
};

let chartConfig = timeseriesPlotConfig(plotData);

console.log(chartConfig);
