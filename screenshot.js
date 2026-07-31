import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/root/.cache/puppeteer/chrome-headless-shell/linux-151.0.7922.47/chrome-headless-shell-linux64/chrome-headless-shell'
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log(e));
  await page.screenshot({ path: 'screenshot.png' });
  
  await browser.close();
})();
