const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  
  await page.goto('http://localhost:5173/org-vehicle-list.html');
  await page.waitForTimeout(2000);
  
  const content = await page.content();
  if (content.includes('No vehicles match')) {
    console.log('SHOWS_EMPTY_TABLE_STATE');
  } else if (content.includes('JQE 1342')) {
    console.log('SHOWS_VEHICLES');
  } else {
    console.log('BLANK_PAGE_OR_OTHER');
  }
  
  await browser.close();
})();
