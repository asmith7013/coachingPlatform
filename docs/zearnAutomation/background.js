// Configuration
const CONFIG = {
  email: 'eburnside@schools.nyc.gov',
  password: 'AlexRules!'
};

const URLS = {
  login: 'https://www.zearn.org/',
  exports: 'https://www.zearn.org/reports/exports_center/308',
  history: 'http://localhost:3000/scm/roadmaps/history'
};

// State management - use storage to persist across service worker restarts
let automationState = {
  active: false,
  tabId: null,
  step: null // 'login', 'waiting_for_auth', 'exports'
};

// Load state from storage on startup
chrome.storage.local.get(['automationState'], (result) => {
  if (result.automationState) {
    automationState = result.automationState;
    console.log('Restored state:', automationState);
  }
});

// Helper to save state
function saveState() {
  chrome.storage.local.set({ automationState });
  console.log('Saved state:', automationState);
}

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startFullFlow') {
    startFullFlow();
    sendResponse({ status: 'started' });
  } else if (message.action === 'getStatus') {
    sendResponse({ state: automationState });
  } else if (message.action === 'exportComplete') {
    // Export script finished, navigate to history
    console.log('Export complete message received!');
    console.log('Current state:', automationState);
    console.log('Sender tab:', sender.tab?.id);

    console.log('Opening history page in new tab:', URLS.history);
    automationState.step = 'complete';
    automationState.active = false;
    saveState();
    // Open history page in a new tab
    chrome.tabs.create({ url: URLS.history })
      .then((tab) => {
        console.log('New tab opened successfully:', tab.id);
      })
      .catch((error) => {
        console.error('Failed to open new tab:', error);
      });
  }
  return true;
});

// Start the full automation flow
async function startFullFlow() {
  console.log('Starting full Zearn automation flow...');

  automationState = {
    active: true,
    tabId: null,
    step: 'login'
  };

  // Create new tab with login page
  const tab = await chrome.tabs.create({ url: URLS.login });
  automationState.tabId = tab.id;
  saveState();

  console.log('Created tab:', tab.id);
}

// Listen for tab updates to continue automation
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Log ALL updates for debugging
  console.log('Tab update event:', {
    tabId,
    changeInfo,
    url: tab.url,
    automationActive: automationState.active,
    expectedTabId: automationState.tabId,
    step: automationState.step
  });

  // Only process our automation tab
  if (!automationState.active) {
    console.log('Ignoring: automation not active');
    return;
  }

  if (tabId !== automationState.tabId) {
    console.log('Ignoring: wrong tab ID');
    return;
  }

  // Wait for page to fully load
  if (changeInfo.status !== 'complete') {
    console.log('Ignoring: page not complete yet, status:', changeInfo.status);
    return;
  }

  const url = tab.url || '';
  console.log('Processing tab update:', url, 'Step:', automationState.step);

  try {
    // Handle based on current step and URL
    // Check if on login page (root URL or /sign_in)
    const urlPath = new URL(url).pathname;
    const isLoginPage = urlPath === '/' || urlPath === '' || url.includes('/sign_in');
    const is2FAPage = url.includes('/two_factor');
    const isExportsPage = url.includes('/exports_center');

    console.log('URL path:', urlPath, 'isLoginPage:', isLoginPage, 'is2FA:', is2FAPage);

    if (automationState.step === 'login' && isLoginPage) {
      // We're on the login page - fill and submit
      console.log('On login page, filling form...');
      await injectLoginScript(tabId);
      automationState.step = 'waiting_for_login';
      saveState();

      // Since Zearn doesn't redirect after login (SPA), wait and then navigate
      console.log('Waiting 1.5 seconds for login to complete...');
      setTimeout(async () => {
        if (automationState.step === 'waiting_for_login') {
          console.log('Navigating to exports page...');
          automationState.step = 'navigating_to_exports';
          saveState();
          await chrome.tabs.update(tabId, { url: URLS.exports });
        }
      }, 1500);
    }
    else if (automationState.step === 'waiting_for_login' && is2FAPage) {
      // 2FA page detected - wait for user to complete
      console.log('2FA required - waiting for user...');
      automationState.step = 'waiting_for_2fa';
      saveState();
    }
    else if (automationState.step === 'waiting_for_2fa' && !is2FAPage && !isLoginPage) {
      // 2FA completed, navigate to exports
      console.log('2FA complete! Navigating to exports...');
      automationState.step = 'navigating_to_exports';
      saveState();
      await chrome.tabs.update(tabId, { url: URLS.exports });
    }
    else if (automationState.step === 'navigating_to_exports' && url.includes('/exports_center')) {
      console.log('On exports page, running export...');
      automationState.step = 'exporting';
      saveState();
      // Small delay to ensure Vue components are mounted, then run export
      // Export script will send 'exportComplete' message when download is clicked
      setTimeout(async () => {
        await injectExportScript(tabId);
      }, 1500);
    }
  } catch (error) {
    console.error('Automation error:', error);
    automationState.active = false;
    automationState.step = 'error';
    saveState();
  }
});

// Inject login script
async function injectLoginScript(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: fillAndSubmitLogin,
    args: [CONFIG.email, CONFIG.password]
  });
}

// Inject export script
async function injectExportScript(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: runExportProcess
  });
}

// Login function (injected into page)
function fillAndSubmitLogin(email, password) {
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  async function doLogin() {
    console.log('Zearn Automation: Filling login form...');

    const emailInput = document.getElementById('user_login_field');
    const passwordInput = document.getElementById('user_password_field');

    if (!emailInput || !passwordInput) {
      console.error('Could not find login fields');
      return;
    }

    // Fill email
    emailInput.focus();
    emailInput.value = email;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    emailInput.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(200);

    // Fill password
    passwordInput.focus();
    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(200);

    // Click sign in
    const signInButton = document.querySelector('button.save-button[type="submit"]');
    if (signInButton) {
      console.log('Zearn Automation: Clicking sign in...');
      signInButton.click();
    }
  }

  doLogin().catch(console.error);
}

// Export function (injected into page)
function runExportProcess() {
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function getDateStrings() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      yesterday: formatDate(yesterday),
      today: formatDate(today),
      yesterdayDate: yesterday,
      todayDate: today
    };
  }

  async function navigateToMonth(targetDate, calendarContainer) {
    const maxAttempts = 24;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const titleButton = calendarContainer.querySelector('.vc-title');
      if (!titleButton) return false;

      const titleText = titleButton.textContent.trim();
      const [monthName, yearStr] = titleText.split(' ');
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const currentMonth = monthNames.indexOf(monthName);
      const currentYear = parseInt(yearStr);

      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();

      if (currentMonth === targetMonth && currentYear === targetYear) {
        return true;
      }

      const currentTotal = currentYear * 12 + currentMonth;
      const targetTotal = targetYear * 12 + targetMonth;

      if (targetTotal < currentTotal) {
        const prevButton = calendarContainer.querySelector('.vc-arrow.vc-prev');
        if (prevButton) {
          prevButton.click();
          await wait(300);
        }
      } else {
        const nextButton = calendarContainer.querySelector('.vc-arrow.vc-next');
        if (nextButton) {
          nextButton.click();
          await wait(300);
        }
      }
      attempts++;
    }
    return false;
  }

  async function selectDate(dateStr, calendarContainer, targetDate) {
    const navigated = await navigateToMonth(targetDate, calendarContainer);
    if (!navigated) return false;

    await wait(200);

    const dayElement = calendarContainer.querySelector(`.vc-day.id-${dateStr} .vc-day-content`);
    if (dayElement) {
      dayElement.click();
      await wait(300);
      return true;
    }
    return false;
  }

  async function doExport() {
    console.log('Zearn Automation: Starting export process...');
    const dates = getDateStrings();

    // Step 1: Select report type
    const reportTypeSelect = document.getElementById('report_type_field');
    if (!reportTypeSelect) {
      console.error('Could not find report type dropdown');
      return;
    }

    console.log('Selecting Student Progress...');
    reportTypeSelect.value = 'student_progress';
    reportTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(1500);

    // Step 2: Open From date picker
    const fromDatepicker = document.querySelector('.from-datepicker');
    if (!fromDatepicker) {
      console.error('Could not find From datepicker');
      return;
    }

    const fromButton = fromDatepicker.querySelector('.date-button');
    if (fromButton) {
      console.log('Opening From date picker...');
      fromButton.click();
      await wait(500);
    }

    // Step 3: Select yesterday
    const fromCalendar = fromDatepicker.querySelector('.vc-pane-container');
    if (fromCalendar) {
      console.log('Selecting yesterday:', dates.yesterday);
      await selectDate(dates.yesterday, fromCalendar, dates.yesterdayDate);
      await wait(500);
    }

    // Step 4: Open To date picker
    const toDatepicker = document.querySelector('.to-datepicker');
    if (!toDatepicker) {
      console.error('Could not find To datepicker');
      return;
    }

    const toButton = toDatepicker.querySelector('.date-button');
    if (toButton) {
      console.log('Opening To date picker...');
      toButton.click();
      await wait(500);
    }

    // Step 5: Select today
    const toCalendar = toDatepicker.querySelector('.vc-pane-container');
    if (toCalendar) {
      console.log('Selecting today:', dates.today);
      await selectDate(dates.today, toCalendar, dates.todayDate);
      await wait(500);
    }

    // Step 6: Click Download
    const downloadButton = document.querySelector('button.download-button:not(.disabled)');
    if (downloadButton) {
      console.log('Clicking Download...');
      downloadButton.click();
      // Wait for download to initiate before navigating away
      await wait(1000);
      console.log('Zearn Automation: Export complete!');
      // Notify background script that export is done
      chrome.runtime.sendMessage({ action: 'exportComplete' });
    } else {
      console.error('Download button not found or disabled');
    }
  }

  doExport().catch(console.error);
}
