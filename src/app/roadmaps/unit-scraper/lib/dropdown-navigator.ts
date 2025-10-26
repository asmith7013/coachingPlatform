import { Page } from 'playwright';
import { RoadmapOption } from './types';

/**
 * Selector constants for the dropdowns on the units page
 * Using stable selectors (aria-labels, parent container) instead of dynamic PrimeReact IDs
 */
const SELECTORS = {
  // Stable parent container
  UNIT_SELECTOR_CONTAINER: '#unitSelector',

  // Use aria-labels for buttons (semantic and stable)
  ROADMAP_BUTTON: '[aria-label="Select a Roadmap"]',
  UNIT_BUTTON: '[aria-label="Select a Unit"]',

  // Use parent container + class combination for inputs
  ROADMAP_INPUT: '#unitSelector .p-inputgroup:has(.p-inputgroup-addon:has-text("Roadmap")) input.p-autocomplete-input',
  UNIT_INPUT: '#unitSelector .p-inputgroup:has(.p-inputgroup-addon:has-text("Unit")) input.p-autocomplete-input',

  // Global panel and item classes (stable)
  AUTOCOMPLETE_PANEL: '.p-autocomplete-panel',
  AUTOCOMPLETE_ITEM: '.p-autocomplete-item',

  // Main content area that updates when selections change
  UNIT_ACCORDION: '.p-accordion'
};

/**
 * Get all available roadmap options from the roadmap dropdown
 */
export async function getAvailableRoadmaps(page: Page): Promise<string[]> {
  console.log('📋 Getting available roadmaps...');

  // Click the roadmap dropdown button to open it
  await page.click(SELECTORS.ROADMAP_BUTTON);
  console.log('  📂 Dropdown opened');

  // Wait for the autocomplete panel to appear
  await page.waitForSelector(SELECTORS.AUTOCOMPLETE_PANEL, { timeout: 5000 });
  await page.waitForTimeout(500); // Extra wait for options to fully load

  // Get all option texts
  const options = await page.locator(SELECTORS.AUTOCOMPLETE_ITEM).allTextContents();

  // Close the dropdown by clicking elsewhere
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log(`  ✅ Found ${options.length} roadmaps`);

  return options;
}

/**
 * Select a roadmap from the roadmap dropdown
 */
export async function selectRoadmap(page: Page, roadmap: RoadmapOption): Promise<void> {
  console.log(`🎯 Selecting roadmap: ${roadmap}`);

  // Click the roadmap dropdown button to open it
  await page.click(SELECTORS.ROADMAP_BUTTON);
  console.log('  📂 Dropdown opened');

  // Wait for the autocomplete panel to appear
  await page.waitForSelector(SELECTORS.AUTOCOMPLETE_PANEL, { timeout: 5000 });
  console.log('  ⏳ Panel appeared');

  // Wait a bit for options to render
  await page.waitForTimeout(300);

  // Get all option elements and find the exact match
  const options = await page.locator(SELECTORS.AUTOCOMPLETE_ITEM).all();

  let found = false;
  for (const option of options) {
    const text = await option.textContent();
    if (text?.trim() === roadmap) {
      await option.click();
      found = true;
      console.log('  ✅ Roadmap selected');
      break;
    }
  }

  if (!found) {
    throw new Error(`Could not find roadmap option: ${roadmap}`);
  }

  // Wait for the unit dropdown to be enabled/populated
  await page.waitForTimeout(1000);

  // Verify selection by checking the input value
  const selectedValue = await page.locator(SELECTORS.ROADMAP_INPUT).inputValue();
  if (selectedValue !== roadmap) {
    throw new Error(`Failed to select roadmap. Expected: ${roadmap}, Got: ${selectedValue}`);
  }

  console.log('  ✓ Selection verified');
}

/**
 * Get all available unit options from the unit dropdown
 */
export async function getAvailableUnits(page: Page): Promise<string[]> {
  console.log('📋 Getting available units...');

  // Click the unit dropdown button to open it
  await page.click(SELECTORS.UNIT_BUTTON);
  console.log('  📂 Dropdown opened');

  // Wait for the autocomplete panel to appear
  await page.waitForSelector(SELECTORS.AUTOCOMPLETE_PANEL, { timeout: 5000 });
  await page.waitForTimeout(500); // Extra wait for options to fully load

  // Get all option texts
  const options = await page.locator(SELECTORS.AUTOCOMPLETE_ITEM).allTextContents();

  // Close the dropdown by clicking elsewhere
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log(`  ✅ Found ${options.length} units`);

  return options;
}

/**
 * Select a specific unit from the unit dropdown
 */
export async function selectUnit(page: Page, unitName: string): Promise<void> {
  console.log(`🎯 Selecting unit: ${unitName}`);

  // Click the unit dropdown button to open it
  await page.click(SELECTORS.UNIT_BUTTON);
  console.log('  📂 Dropdown opened');

  // Wait for the autocomplete panel to appear
  await page.waitForSelector(SELECTORS.AUTOCOMPLETE_PANEL, { timeout: 5000 });
  console.log('  ⏳ Panel appeared');

  // Click the option with the matching text
  const optionSelector = `${SELECTORS.AUTOCOMPLETE_ITEM}:has-text("${unitName}")`;
  await page.click(optionSelector);
  console.log('  ✅ Unit selected');

  // Wait for the page to update with the new unit's content
  await page.waitForTimeout(1500);

  // Wait for the accordion to be present (indicates page has updated)
  await page.waitForSelector(SELECTORS.UNIT_ACCORDION, { timeout: 10000 });

  // Verify selection by checking the input value
  const selectedValue = await page.locator(SELECTORS.UNIT_INPUT).inputValue();
  if (selectedValue !== unitName) {
    throw new Error(`Failed to select unit. Expected: ${unitName}, Got: ${selectedValue}`);
  }

  console.log('  ✓ Selection verified, content loaded');
}

/**
 * Navigate to the units page and wait for it to be ready
 */
export async function navigateToUnitsPage(page: Page): Promise<void> {
  const url = 'https://roadmaps.teachtoone.org/units';
  console.log(`🌐 Navigating to: ${url}`);

  await page.goto(url, { waitUntil: 'networkidle' });

  // After networkidle, page is ready - no need to wait for specific selectors
  console.log('✅ Units page loaded and ready');
}
