// playwright.config.js
const config = {
  testDir: 'playwright',
  use: {
    headless: true,
    viewport: { width: 800, height: 600 },
  },
  reporter: 'list',
};

export default config;
