const puppeteer = require('puppeteer');
const { chromium } = require('playwright');

(async () => {
  /* Puppeteer Launch */
  /* Puppeteer launches in headless mode by default, hence why we need to explicitly say false to it */
  const PuppeteerBrowser = await puppeteer.launch({ headless: false });
  const PuppeteerPage = await PuppeteerBrowser.newPage();
  /* Playwright Launch */
  const PlaywrightBrowser = await chromium.launch({
    headless: false,
  });
  const PlaywrightContext = await PlaywrightBrowser.newContext();
  const PlaywrightPage = await PlaywrightContext.newPage();

  /* Open page in both browsers*/
  await PlaywrightPage.goto('https://www.example.com');
  await PuppeteerPage.goto('https://www.example.com', {
    waitUntil: 'networkidle2',
  });

  /* Sleep for 10 seconds */
  await new Promise((r) => setTimeout(r, 10000));

  /* Close both browsers*/
  await PuppeteerBrowser.close();
  await PlaywrightContext.close();
  await PlaywrightBrowser.close();
})();
