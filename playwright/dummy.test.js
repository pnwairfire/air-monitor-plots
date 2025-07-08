
// import { test, expect } from 'playwright/test';

// test.describe('dummy.html', () => {
//   test('renders a simple Highcharts bar chart and sets render time', async ({ page }) => {
//     // Load local HTML page via file:// protocol
//     const fileUrl = new URL('./dummy.html', import.meta.url).href;
//     await page.goto(fileUrl);

//     // Wait for Highcharts to finish rendering
//     await page.waitForFunction(() => window.highchartsRenderTime !== undefined, null, {
//       timeout: 5000
//     });

//     // // ✅ Check chart container is present and visible
//     // const chartContainer = await page.$('#container');
//     // expect(chartContainer).not.toBeNull();
//     // expect(await chartContainer.isVisible()).toBe(true);

//     // // ✅ Check that an SVG was rendered (means Highcharts ran)
//     // const hasChartSVG = await page.$eval('#container svg', el => !!el);
//     // expect(hasChartSVG).toBe(true);

//     // // ✅ Check chart title text
//     // const titleText = await page.$eval('.highcharts-title', el => el.textContent.trim());
//     // expect(titleText).toBe('Fruit Consumption');

//     // // ✅ Check x-axis labels
//     // const xLabels = await page.$$eval('.highcharts-xaxis-labels text', els =>
//     //   els.map(el => el.textContent.trim())
//     // );
//     // expect(xLabels).toEqual(['Apples', 'Bananas', 'Oranges']);

//     // Log render time
//     const renderTime = await page.evaluate(() => window.highchartsRenderTime);
//     console.log(`✅ Dummy chart render time: ${renderTime} ms`);
//   });
// });
