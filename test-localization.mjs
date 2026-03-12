import { chromium } from 'playwright';

async function testLocalization() {
  console.log('Starting localization test...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Track console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  try {
    // Create user via API first to ensure we have a valid session
    console.log('1. Creating test user via API...');
    const response = await fetch('http://localhost:3000/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Farmer',
        state: 'Punjab',
        district: 'Ludhiana',
        land_size: '5',
        crops: ['Wheat', 'Rice'],
        income_category: 'Small (<2 hectares)',
        preferred_language: 'en'
      })
    });
    const userData = await response.json();
    console.log(`   ✓ Created user with ID: ${userData.id}`);
    
    // Navigate to the app and set localStorage
    console.log('\n2. Navigating to app and setting session...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Set user ID in localStorage
    await page.evaluate((id) => localStorage.setItem('kisan_user_id', String(id)), userData.id);
    console.log(`   ✓ Set user ID in localStorage: ${userData.id}`);
    
    // Navigate to chat page
    console.log('\n3. Navigating to chat page...');
    await page.goto('http://localhost:3000/chat', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const chatUrl = page.url();
    console.log(`   Chat URL: ${chatUrl}`);
    
    // Take screenshot of chat
    await page.screenshot({ path: 'test-chat-initial.png', fullPage: true });
    console.log('   ✓ Screenshot saved: test-chat-initial.png');
    
    // Get welcome message
    const welcomeMsg = await page.$('[class*="rounded-3xl"]');
    if (welcomeMsg) {
      const text = await welcomeMsg.textContent();
      console.log(`   Welcome message: "${text.substring(0, 80)}..."`);
    }
    
    // ===== TEST LANGUAGE SELECTOR =====
    console.log('\n4. Testing language selector...');
    
    // Debug: Print all buttons
    const allButtons = await page.$$('button');
    console.log(`   Found ${allButtons.length} buttons on page`);
    
    // Find the language selector button
    let langSelectorFound = false;
    for (let i = 0; i < allButtons.length; i++) {
      const btn = allButtons[i];
      const html = await btn.evaluate(el => el.outerHTML);
      const text = await btn.textContent();
      
      // Check if this button has the Globe icon
      if (html.includes('Globe') || html.includes('globe')) {
        console.log(`   Button ${i}: Has Globe icon`);
        console.log(`   HTML snippet: ${html.substring(0, 200)}...`);
        
        // Check if it's the language selector (should have emerald styling)
        if (html.includes('emerald')) {
          console.log(`   ✓ Found language selector button`);
          
          // Take screenshot before clicking
          await page.screenshot({ path: 'test-before-click.png', fullPage: true });
          
          // Click the button
          await btn.click();
          langSelectorFound = true;
          console.log(`   ✓ Clicked language selector`);
          
          // Wait for dropdown
          await page.waitForTimeout(1000);
          
          // Take screenshot after clicking
          await page.screenshot({ path: 'test-after-click.png', fullPage: true });
          console.log(`   ✓ Screenshot saved: test-after-click.png`);
          break;
        }
      }
    }
    
    if (!langSelectorFound) {
      console.log('   ⚠ Language selector button not found');
    }
    
    // Check if dropdown is visible
    console.log('\n5. Checking for language dropdown...');
    
    // Look for the dropdown container
    const dropdown = await page.$('[class*="rounded-2xl"][class*="shadow-xl"]');
    if (dropdown) {
      const html = await dropdown.evaluate(el => el.outerHTML);
      console.log(`   ✓ Dropdown found`);
      console.log(`   Dropdown HTML: ${html.substring(0, 500)}...`);
    } else {
      console.log('   ⚠ Dropdown not found with expected classes');
      
      // Try alternative selectors
      const altDropdown = await page.$('.overflow-y-auto, [class*="overflow-y-auto"]');
      if (altDropdown) {
        const content = await altDropdown.textContent();
        console.log(`   Alternative dropdown content: ${content.substring(0, 300)}...`);
      }
    }
    
    // Try to find language buttons directly
    console.log('\n6. Looking for language buttons...');
    const languagesToTest = [
      { code: 'hi', native: 'हिन्दी', name: 'Hindi' },
      { code: 'ta', native: 'தமிழ்', name: 'Tamil' },
      { code: 'ur', native: 'اردو', name: 'Urdu (RTL)' },
      { code: 'bn', native: 'বাংলা', name: 'Bengali' },
      { code: 'pa', native: 'ਪੰਜਾਬੀ', name: 'Punjabi' }
    ];
    
    // Get all visible text on page
    const pageText = await page.$eval('body', el => el.textContent);
    console.log(`   Page text length: ${pageText.length}`);
    
    for (const lang of languagesToTest) {
      const found = pageText.includes(lang.native);
      console.log(`   ${lang.name} (${lang.native}): ${found ? '✓ Found on page' : '✗ Not found'}`);
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-final-state.png', fullPage: true });
    console.log('\n7. ✓ Final screenshot saved: test-final-state.png');
    
    // Check for errors
    console.log('\n8. Checking for errors...');
    if (consoleErrors.length > 0) {
      console.log('   ❌ Console errors found:');
      consoleErrors.forEach(e => console.log(`      - ${e.substring(0, 200)}`));
    } else {
      console.log('   ✓ No console errors');
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testLocalization().catch(console.error);