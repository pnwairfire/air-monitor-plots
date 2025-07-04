// import { test, expect } from 'playwright/test';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const htmlPath = path.resolve(__dirname, './aqi-bar-test.html');

// test('AQI stacked bar renders colored rectangles', async ({ page }) => {
//   await page.goto('file://' + htmlPath);

//   // Wait for at least one AQI rectangle
//   const rects = await page.locator('svg rect').all();

//   // Count the number of rects with expected AQI colors
//   const coloredRects = await Promise.all(
//     rects.map(async (el) => {
//       const fill = await el.getAttribute('fill');
//       return /^rgb\(/.test(fill || '') ? fill : null;
//     })
//   );

//   const visibleRects = coloredRects.filter(Boolean);
//   expect(visibleRects.length).toBeGreaterThan(0);
// });
