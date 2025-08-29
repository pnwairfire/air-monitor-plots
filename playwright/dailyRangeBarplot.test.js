// playwright/dailyRangeBarplot.test.js
import { test, expect } from 'playwright/test';

test.describe('dailyRangeBarplot.html', () => {
  test('renders a Highcharts chart and sets render time', async ({ page }) => {
    // Load the test file via file:// URL
    const fileUrl = new URL('./dailyRangeBarplot.html', import.meta.url).href;
    await page.goto(fileUrl);

    // Wait for the global variable to be set by the chart's load event
    await page.waitForFunction(() => window.highchartsRenderTime !== undefined, null, {
      timeout: 15000
    });

    // Assert the chart container exists and is visible
    const chartContainer = await page.$('#container');
    expect(chartContainer).not.toBeNull();
    expect(await chartContainer.isVisible()).toBe(true);

    // Get render time from the page
    const renderTime = await page.evaluate(() => window.highchartsRenderTime);
    console.log(`✅ Chart render time: ${renderTime} ms`);

    // Optional: Check if a Highcharts chart was actually created
    const hasChartSVG = await page.$eval('#container svg', el => !!el);
    expect(hasChartSVG).toBe(true);
  });
});

