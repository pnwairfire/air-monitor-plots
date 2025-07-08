// playwright.config.js
const config = {
  testDir: 'playwright',
  // // //workers: 1, // run tests serially
  use: {
    headless: true,
    viewport: { width: 800, height: 600 },
  },
  reporter: 'list',
};

export default config;
