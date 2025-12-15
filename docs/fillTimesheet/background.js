// Configuration
const API_ENDPOINT = "https://www.solvescoaching.com/api/timesheet";
const API_KEY = "timesheet-dev-key-2024";

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'submitTimesheet') {
    console.log('Received timesheet data:', message.data);

    // Make the API call from the extension context (bypasses CORS)
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entries: message.data.entries,
        apiKey: API_KEY
      })
    })
      .then(response => response.json())
      .then(result => {
        console.log('API response:', result);
        sendResponse({ success: result.success, data: result });
      })
      .catch(error => {
        console.error('API error:', error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate we'll send response asynchronously
    return true;
  }
});
