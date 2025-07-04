// import { test, expect } from 'playwright/test';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const htmlPath = path.resolve(__dirname, './timeseriesPlot.test.html');

// test('timeseriesPlot renders a chart with datetime x-axis', async ({ page }) => {
//   await page.goto('file://' + htmlPath);

//   // Assert the SVG chart appears
//   await expect(page.locator('#container svg')).toHaveCount(1);

//   // Check title
//   const title = await page.locator('.highcharts-title').textContent();
//   expect(title).toContain('Test Location');

//   // Check x-axis label content
//   const xTick = await page.locator('.highcharts-xaxis-labels text').first().textContent();
//   expect(xTick).toMatch(/\d{1,2}(:\d{2})?/); // Rough match for time
// });
