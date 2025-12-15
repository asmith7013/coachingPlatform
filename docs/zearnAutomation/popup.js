// Configuration (for manual steps)
const CONFIG = {
  email: 'eburnside@schools.nyc.gov',
  password: 'AlexRules!'
};

// Helper to show status
function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status show ${type}`;
}

// Full Flow button - uses background script
document.getElementById('fullFlowBtn').addEventListener('click', async () => {
  showStatus('Starting automation...', 'info');

  try {
    chrome.runtime.sendMessage({ action: 'startFullFlow' }, (response) => {
      if (response && response.status === 'started') {
        showStatus('Opening Zearn... Complete 2FA if prompted.', 'success');
      }
    });
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  }
});

// Manual Login button
document.getElementById('loginBtn').addEventListener('click', async () => {
  showStatus('Filling login form...', 'info');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: fillLoginForm,
      args: [CONFIG.email, CONFIG.password]
    });

    showStatus('Login form filled!', 'success');
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  }
});

// Manual Export button
document.getElementById('exportBtn').addEventListener('click', async () => {
  showStatus('Starting export...', 'info');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: runExportProcess
    });

    showStatus('Export started!', 'success');
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  }
});

// Login function (injected into page)
function fillLoginForm(email, password) {
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  async function doLogin() {
    const emailInput = document.getElementById('user_login_field');
    const passwordInput = document.getElementById('user_password_field');

    if (!emailInput || !passwordInput) {
      alert('Could not find login fields. Are you on the Zearn login page?');
      return;
    }

    emailInput.focus();
    emailInput.value = email;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    emailInput.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(200);

    passwordInput.focus();
    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(200);

    const signInButton = document.querySelector('button.save-button[type="submit"]');
    if (signInButton) {
      signInButton.click();
    } else {
      alert('Could not find Sign In button.');
    }
  }

  doLogin().catch(error => alert('Login error: ' + error.message));
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
    const dates = getDateStrings();
    console.log('Export dates:', dates);

    // Step 1: Select report type
    const reportTypeSelect = document.getElementById('report_type_field');
    if (!reportTypeSelect) {
      alert('Could not find report type dropdown. Are you on the Exports Center page?');
      return;
    }

    reportTypeSelect.value = 'student_progress';
    reportTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(1500);

    // Step 2: From date
    const fromDatepicker = document.querySelector('.from-datepicker');
    if (!fromDatepicker) {
      alert('Could not find From datepicker.');
      return;
    }

    const fromButton = fromDatepicker.querySelector('.date-button');
    if (fromButton) {
      fromButton.click();
      await wait(500);
    }

    const fromCalendar = fromDatepicker.querySelector('.vc-pane-container');
    if (fromCalendar) {
      await selectDate(dates.yesterday, fromCalendar, dates.yesterdayDate);
      await wait(500);
    }

    // Step 3: To date
    const toDatepicker = document.querySelector('.to-datepicker');
    if (!toDatepicker) {
      alert('Could not find To datepicker.');
      return;
    }

    const toButton = toDatepicker.querySelector('.date-button');
    if (toButton) {
      toButton.click();
      await wait(500);
    }

    const toCalendar = toDatepicker.querySelector('.vc-pane-container');
    if (toCalendar) {
      await selectDate(dates.today, toCalendar, dates.todayDate);
      await wait(500);
    }

    // Step 4: Download
    const downloadButton = document.querySelector('button.download-button:not(.disabled)');
    if (downloadButton) {
      downloadButton.click();
      console.log('Export complete!');
    } else {
      alert('Download button not found or disabled.');
    }
  }

  doExport().catch(error => alert('Export error: ' + error.message));
}
