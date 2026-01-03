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
    setReactValue(inputElement, optionText);
    await wait(50); // Small wait for React to process

    inputElement.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40,
      bubbles: true
    }));

    inputElement.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true
    }));
    await wait(50); // Wait for selection to apply

    const updatedInput = document.getElementById(inputId);
    const finalValue = updatedInput.value;

    return finalValue === optionText || finalValue.includes(optionText);
  };

  // Helper function to set hours in number input
  const setHours = async (hoursInput, hours) => {
    hoursInput.focus();
    setReactValue(hoursInput, hours.toString());
    await wait(50);
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

        // Note: Do NOT use numberInputs[1] as fallback - that's the total pay field, not the rate
        // The rate should only come from $ prefixed inputs or Rate class elements

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

            // Send data to background script which has permission to make the API call
            chrome.runtime.sendMessage(
              { action: 'submitTimesheet', data: { entries: entriesWithDate } },
              (response) => {
                if (response?.success) {
                  console.log('Successfully saved to database:', response.data);
                } else {
                  console.error('Failed to save to database:', response?.error);
                }
              }
            );
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

      const rows = findAllRows();
      const currentRow = rows[i];

      if (!currentRow) {
        alert('Could not find row to fill!');
        return;
      }

      const selectInputs = currentRow.querySelectorAll('.mantine-Select-input');
      const hoursInput = currentRow.querySelector('.mantine-NumberInput-input');

      const taskInput = selectInputs[0];
      const projectInput = selectInputs[1];

      if (!taskInput || !projectInput || !hoursInput) {
        alert('Could not find all inputs in the current row!');
        return;
      }

      const taskSelected = await selectFromDropdown(taskInput, entry.task);
      if (!taskSelected) {
        alert(`Could not select task: ${entry.task}`);
        return;
      }

      const projectSelected = await selectFromDropdown(projectInput, entry.project);
      if (!projectSelected) {
        alert(`Could not select project: ${entry.project}`);
        return;
      }

      await setHours(hoursInput, entry.hours);

      if (i < entries.length - 1) {
        const buttons = document.querySelectorAll('button');
        let addRowButton = null;

        for (const btn of buttons) {
          if (btn.textContent.trim() === 'Add New Row') {
            addRowButton = btn;
            break;
          }
        }

        if (addRowButton) {
          addRowButton.click();
          await wait(300); // Wait for new row to render
        } else {
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
