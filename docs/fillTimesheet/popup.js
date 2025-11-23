// Configuration
const API_ENDPOINT = "https://www.solvescoaching.com/api/timesheet";
const API_KEY = "timesheet-dev-key-2024";

document.getElementById('fillBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = 'Filling form and enabling tracking...';
  statusDiv.className = 'status';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Execute both functions: fill the form AND setup the submit interceptor
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: fillTimecardFormAndSetupTracking
    });

    statusDiv.textContent = 'Form filled & tracking enabled!';
    statusDiv.className = 'status success';
  } catch (error) {
    statusDiv.textContent = 'Error: ' + error.message;
    statusDiv.className = 'status error';
  }
});

// Combined function: fills the form AND sets up submit tracking
function fillTimecardFormAndSetupTracking() {
  const API_ENDPOINT = "https://www.solvescoaching.com/api/timesheet";
  const API_KEY = "timesheet-dev-key-2024";

  // Configuration - modify these values for your specific tasks
  const entries = [
    {
      task: "Lead coaching activities: 1-1 coaching sessions, micro group PL, or walkthrough",
      project: "PH_Studio Classroom Project",
      hours: 6
    },
    {
      task: "Lead coaching activities: 1-1 coaching sessions, micro group PL, or walkthrough",
      project: "PH_Studio Classroom Project",
      hours: 1
    },
    {
      task: "Content Development",
      project: "PH_Studio Classroom Project",
      hours: 1
    },
    {
      task: "Site Context + Support: Meetings and collaborations with project team members and/or partners to support the overall project success",
      project: "PH_Studio Classroom Project",
      hours: 1
    }
  ];

  // Helper function to wait
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper function to trigger React events properly
  const setReactValue = (element, value) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(element, value);

    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
    element.dispatchEvent(new Event('change', { bubbles: true }));
  };

  // Helper function to set dropdown value
  const selectFromDropdown = async (inputElement, optionText) => {
    const inputId = inputElement.id;

    inputElement.focus();
    await wait(300);

    setReactValue(inputElement, optionText);
    await wait(600);

    console.log(`Set value to "${optionText}", now pressing ArrowDown...`);

    inputElement.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40,
      bubbles: true
    }));
    await wait(300);

    console.log('Pressing Enter to select...');
    inputElement.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true
    }));
    await wait(500);

    const updatedInput = document.getElementById(inputId);
    const finalValue = updatedInput.value;
    console.log(`Final value after Enter: "${finalValue}"`);

    return finalValue === optionText || finalValue.includes(optionText);
  };

  // Helper function to set hours in number input
  const setHours = async (hoursInput, hours) => {
    hoursInput.focus();
    setReactValue(hoursInput, hours.toString());
    await wait(300);
  };

  // Helper function to find row containers
  const findAllRows = () => {
    const rows = [];
    const allGridDivs = document.querySelectorAll('.grid.gap-4');

    for (const div of allGridDivs) {
      const selectInputs = div.querySelectorAll('.mantine-Select-input');
      const numberInput = div.querySelector('.mantine-NumberInput-input');

      if (selectInputs.length === 2 && numberInput) {
        rows.push(div);
      }
    }

    return rows;
  };

  // ============================================
  // SUBMIT TRACKING FUNCTIONS
  // ============================================

  // Helper to find all filled rows for submit tracking
  const findAllFilledRows = () => {
    const rows = [];
    const allGridDivs = document.querySelectorAll('.grid.gap-4');

    for (const div of allGridDivs) {
      const selectInputs = div.querySelectorAll('.mantine-Select-input');
      const numberInputs = div.querySelectorAll('.mantine-NumberInput-input');

      if (selectInputs.length === 2 && numberInputs.length >= 1) {
        const taskValue = selectInputs[0]?.value;
        const projectValue = selectInputs[1]?.value;
        const hoursValue = numberInputs[0]?.value;

        let rateValue = 0;

        const rowParent = div.closest('.grid') || div.parentElement;
        const allInputsInParent = rowParent?.querySelectorAll('input');
        allInputsInParent?.forEach(input => {
          if (input.value && input.value.startsWith('$')) {
            rateValue = parseFloat(input.value.replace('$', '')) || 0;
          }
        });

        const rateText = rowParent?.querySelector('[class*="Rate"]')?.textContent;
        if (rateText) {
          rateValue = parseFloat(rateText.replace('$', '')) || rateValue;
        }

        if (rateValue === 0 && numberInputs.length >= 2) {
          rateValue = parseFloat(numberInputs[1]?.value) || 0;
        }

        if (taskValue && projectValue && hoursValue) {
          rows.push({
            task: taskValue,
            project: projectValue,
            hours: parseFloat(hoursValue) || 0,
            rate: rateValue
          });
        }
      }
    }

    return rows;
  };

  // Helper to get the date from the form
  const getFormDate = () => {
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput?.value) {
      return dateInput.value;
    }

    const dateText = document.body.innerText.match(/(\w+ \d{1,2}, \d{4})/);
    if (dateText) {
      const parsed = new Date(dateText[1]);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    }

    return new Date().toISOString().split('T')[0];
  };

  // Setup submit interceptor
  const setupSubmitInterceptor = () => {
    const interceptSubmit = () => {
      const buttons = document.querySelectorAll('button');

      for (const btn of buttons) {
        if (btn.textContent.trim() === 'Submit' && !btn.dataset.intercepted) {
          btn.dataset.intercepted = 'true';

          btn.addEventListener('click', async (e) => {
            console.log('Submit button clicked - capturing form data...');

            const entries = findAllFilledRows();
            const date = getFormDate();

            console.log('Captured entries:', entries);
            console.log('Date:', date);

            if (entries.length === 0) {
              console.warn('No entries found to submit');
              return;
            }

            const entriesWithDate = entries.map(entry => ({
              ...entry,
              date
            }));

            try {
              const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  entries: entriesWithDate,
                  apiKey: API_KEY
                })
              });

              const result = await response.json();

              if (result.success) {
                console.log('Successfully saved to local database:', result);
              } else {
                console.error('Failed to save to local database:', result.error);
              }
            } catch (error) {
              console.error('Error sending to local API:', error);
            }
          });

          console.log('Submit button interceptor attached');
        }
      }
    };

    interceptSubmit();

    const observer = new MutationObserver(() => {
      interceptSubmit();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('Submit interceptor setup complete');
  };

  // ============================================
  // MAIN FUNCTION: FILL FORM + SETUP TRACKING
  // ============================================

  async function fillFormAndTrack() {
    // First, setup the submit interceptor
    setupSubmitInterceptor();
    console.log('Tracking enabled!');

    // Then fill the form
    let initialRows = findAllRows();
    console.log(`Initially found ${initialRows.length} row(s)`);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      console.log(`\n=== Filling entry ${i + 1} ===`, entry);

      await wait(500);

      const rows = findAllRows();
      console.log(`Found ${rows.length} row(s)`);

      const currentRow = rows[i];

      if (!currentRow) {
        alert('Could not find row to fill!');
        return;
      }

      const selectInputs = currentRow.querySelectorAll('.mantine-Select-input');
      const hoursInput = currentRow.querySelector('.mantine-NumberInput-input');

      const taskInput = selectInputs[0];
      const projectInput = selectInputs[1];

      console.log('Task input ID:', taskInput?.id, 'Value:', taskInput?.value || '(empty)');
      console.log('Project input ID:', projectInput?.id, 'Value:', projectInput?.value || '(empty)');
      console.log('Hours input ID:', hoursInput?.id, 'Value:', hoursInput?.value || '(empty)');

      if (!taskInput || !projectInput || !hoursInput) {
        alert('Could not find all inputs in the current row!');
        return;
      }

      console.log('About to fill Task dropdown...');
      const taskSelected = await selectFromDropdown(taskInput, entry.task);
      if (!taskSelected) {
        alert(`Could not select task: ${entry.task}`);
        return;
      }

      await wait(300);
      if (taskInput.value !== entry.task) {
        console.error(`Task not set correctly. Expected "${entry.task}", got "${taskInput.value}"`);
        alert(`Task was not set correctly in row ${i + 1}`);
        return;
      }

      console.log('About to fill Project dropdown...');
      const projectSelected = await selectFromDropdown(projectInput, entry.project);
      if (!projectSelected) {
        alert(`Could not select project: ${entry.project}`);
        return;
      }

      await wait(300);
      if (projectInput.value !== entry.project) {
        console.error(`Project not set correctly. Expected "${entry.project}", got "${projectInput.value}"`);
        alert(`Project was not set correctly in row ${i + 1}`);
        return;
      }

      console.log('About to fill Hours...');
      await setHours(hoursInput, entry.hours);

      await wait(500);

      if (i < entries.length - 1) {
        console.log('Looking for "Add New Row" button...');
        const buttons = document.querySelectorAll('button');
        let addRowButton = null;

        for (const btn of buttons) {
          if (btn.textContent.trim() === 'Add New Row') {
            addRowButton = btn;
            break;
          }
        }

        if (addRowButton) {
          console.log('Clicking "Add New Row"');
          addRowButton.click();
          await wait(1000);
        } else {
          console.error('Could not find "Add New Row" button');
          alert('Could not find "Add New Row" button');
          return;
        }
      }
    }

    console.log('Timecard filled and tracking enabled!');
  }

  fillFormAndTrack().catch(error => {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  });
}
