import { Page } from 'playwright';
import { RoadmapsCredentials, ROADMAPS_CONSTANTS } from './types';

/**
 * Debug password field interaction issues
 */
export async function debugPasswordField(page: Page): Promise<void> {
  console.log('🔍 Debugging password field...');
  
  const passwordField = page.locator(ROADMAPS_CONSTANTS.PASSWORD_FIELD_SELECTOR);
  const count = await passwordField.count();
  console.log(`🔍 Password field count: ${count}`);
  
  if (count > 0) {
    const isVisible = await passwordField.isVisible();
    const isEnabled = await passwordField.isEnabled();
    const isEditable = await passwordField.isEditable();
    
    console.log(`🔍 Field state - Visible: ${isVisible}, Enabled: ${isEnabled}, Editable: ${isEditable}`);
    
    // Check if field is obscured
    const boundingBox = await passwordField.boundingBox();
    console.log('🔍 Field bounding box:', boundingBox);
    
    // Check for overlapping elements
    if (boundingBox) {
      const elementAtPoint = await page.locator('*').filter({
        has: page.locator(':scope').filter({
          hasText: /.*/
        })
      }).first();
      
      if (elementAtPoint) {
        console.log('⚠️ Potential overlapping elements detected');
      }
    }
  }
}

/**
 * Handle authentication flow for Teach to One Roadmaps
 * First navigates to the login page, then performs the two-step process: login button click, then email/password form
 */
export async function authenticateRoadmaps(
  page: Page, 
  credentials: RoadmapsCredentials
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔐 Starting Roadmaps authentication...');
    
    // Step 1: Navigate to the login page first
    console.log('🌐 Navigating to login page:', ROADMAPS_CONSTANTS.LOGIN_URL);
    await page.goto(ROADMAPS_CONSTANTS.LOGIN_URL, { waitUntil: 'networkidle' });
    console.log('✅ Login page loaded');
    
    // Step 2: Look for and click the login button
    console.log('📍 Looking for login button...');
    const loginButton = await page.locator(ROADMAPS_CONSTANTS.LOGIN_BUTTON_SELECTOR);
    
    if (await loginButton.count() > 0) {
      console.log('✅ Login button found, clicking...');
      await loginButton.click();
      
      // Wait for login form to appear
      await page.waitForSelector(ROADMAPS_CONSTANTS.EMAIL_FIELD_SELECTOR, { timeout: 10000 });
      console.log('📝 Login form appeared');
    } else {
      console.log('ℹ️ No login button found, assuming already on login form');
    }
    
    // Step 3: Enhanced email field handling
    console.log('📧 Filling email field...');
    const emailField = page.locator(ROADMAPS_CONSTANTS.EMAIL_FIELD_SELECTOR);
    await emailField.click(); // Focus first
    await emailField.clear(); // Clear any existing value
    await emailField.fill(credentials.email);

    // Verify email was filled
    const emailValue = await emailField.inputValue();
    if (emailValue !== credentials.email) {
      throw new Error('Email field was not filled correctly');
    }

    // Step 4: Enhanced password field handling with multiple fallback strategies
    console.log('🔑 Filling password field...');
    const passwordField = page.locator(ROADMAPS_CONSTANTS.PASSWORD_FIELD_SELECTOR);

    // Debug the password field first
    await debugPasswordField(page);

    // Strategy 1: Standard approach with proper focus
    await passwordField.click();
    await page.waitForTimeout(500); // Small delay for field to be ready
    await passwordField.clear();
    await passwordField.fill(credentials.password);

    // Verify password was filled
    let passwordValue = await passwordField.inputValue();
    if (!passwordValue || passwordValue !== credentials.password) {
      console.log('⚠️ Password fill failed, trying alternative approach...');
      
      // Strategy 2: Character-by-character typing
      await passwordField.click();
      await passwordField.clear();
      await page.keyboard.type(credentials.password, { delay: 100 });
      
      // Verify again
      passwordValue = await passwordField.inputValue();
      if (!passwordValue) {
        // Strategy 3: Try alternative selector
        console.log('⚠️ Trying alternative password selector...');
        const altPasswordField = page.locator(ROADMAPS_CONSTANTS.ALT_PASSWORD_SELECTOR);
        if (await altPasswordField.count() > 0) {
          await altPasswordField.click();
          await altPasswordField.fill(credentials.password);
          
          const altValue = await altPasswordField.inputValue();
          if (!altValue) {
            throw new Error('Password field could not be filled with any method');
          }
        } else {
          throw new Error('Password field could not be filled with any method');
        }
      }
    }

    console.log('✅ Password field filled successfully');

    // Step 5: Wait before submission to allow form validation
    await page.waitForTimeout(1000);
    
    // Step 6: Submit the form
    console.log('🚀 Submitting login form...');
    await page.click(ROADMAPS_CONSTANTS.SUBMIT_BUTTON_SELECTOR);
    
    // Step 7: Wait for navigation after login
    console.log('⏳ Waiting for authentication to complete...');

    // Wait a moment for navigation to start
    await page.waitForTimeout(3000);

    // Check if we're still on a login page or got an error
    const currentUrl = page.url();
    console.log(`🔍 Current URL after login: ${currentUrl}`);

    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      // Look for error messages
      const errorSelectors = [
        '.error', '.alert', '.notification',
        '[class*="error"]', '[class*="alert"]',
        'text=Invalid', 'text=incorrect', 'text=failed'
      ];

      for (const selector of errorSelectors) {
        const errorElement = page.locator(selector);
        if (await errorElement.count() > 0) {
          const errorText = await errorElement.first().textContent();
          console.log('❌ Authentication error found:', errorText);
          return { success: false, error: `Authentication failed: ${errorText}` };
        }
      }

      return { success: false, error: 'Authentication failed: Still on login page after credentials submission' };
    }

    // If we're not on login page, consider it successful
    console.log('✅ Authentication successful!');
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
    console.error('💥 Authentication error:', errorMessage);
    
    // Provide specific guidance for password issues
    if (errorMessage.includes('Password field')) {
      return { 
        success: false, 
        error: `Password field issue: ${errorMessage}. Try refreshing the page or checking for browser extensions that might interfere.` 
      };
    }
    
    return { success: false, error: `Authentication failed: ${errorMessage}` };
  }
}

/**
 * Check if we need to authenticate by looking for login elements
 */
export async function needsAuthentication(page: Page): Promise<boolean> {
  try {
    // Check for login button or login form fields
    const loginIndicators = [
      ROADMAPS_CONSTANTS.LOGIN_BUTTON_SELECTOR,
      ROADMAPS_CONSTANTS.EMAIL_FIELD_SELECTOR,
      ROADMAPS_CONSTANTS.PASSWORD_FIELD_SELECTOR
    ];
    
    for (const selector of loginIndicators) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        return true;
      }
    }
    
    // Also check URL for login indicators
    const currentUrl = page.url();
    return currentUrl.includes('login') || currentUrl.includes('auth');
    
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return true; // Assume we need to authenticate if we can't determine
  }
}
