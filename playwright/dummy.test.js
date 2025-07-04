// playwright/dummy.test.js
import { test, expect } from 'playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dummyPath = path.resolve(__dirname, 'dummy.html');
const dummyUrl = 'file://' + dummyPath;


test('Highcharts dummy chart renders correctly', async ({ page }) => {
  await page.goto(dummyUrl);
  await page.waitForSelector('.highcharts-title');

  await test.step('chart container is visible', async () => {
    await expect(page.locator('#container')).toBeVisible();
  });

  await test.step('chart title is correct', async () => {
    await expect(page.locator('.highcharts-title')).toHaveText('Fruit Consumption');
  });

  await test.step('x-axis labels are correct', async () => {
    const categories = ['Apples', 'Bananas', 'Oranges'];
    for (const label of categories) {
      const labelNode = page.locator('.highcharts-xaxis-labels text', {
        hasText: label,
      });
      await expect(labelNode).toHaveCount(1);
    }
  });

  await test.step('chart screenshot is captured', async () => {
    await page.locator('#container').screenshot({ path: 'playwright/dummy-chart.png' });
  });

  await test.step('render time is available', async () => {
    await page.waitForFunction(() => window.highchartsRenderTime !== undefined);
    const time = await page.evaluate(() => window.highchartsRenderTime);
    console.log(`✅ Highcharts rendered in ${time} ms`);
  });
});
