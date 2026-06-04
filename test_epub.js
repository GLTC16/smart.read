const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error));

  console.log('Navigating to vercel...');
  await page.goto('https://smart-read-rouge.vercel.app');
  
  // Wait for load
  await page.waitForTimeout(3000);
  
  // Click on the default EPUB or upload one
  // Default epub is loaded by clicking the book cover in the grid if logged in, or we can just try to click the first book
  // Actually, wait, without login, we can't see the cloud. But wait, on the home page there is a demo EPUB?
  // Let's just login
  await page.goto('https://smart-read-rouge.vercel.app/login');
  await page.fill('input[type="email"]', 'test@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Entrar con Email")');
  await page.waitForTimeout(3000);
  
  await page.click('text=Moby Dick'); // Click a book to open EPUB
  await page.waitForTimeout(5000);
  
  await browser.close();
})();
