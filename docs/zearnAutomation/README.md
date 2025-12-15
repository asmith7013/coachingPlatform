# Zearn Export Automation Chrome Extension

Automates downloading Student Progress exports from Zearn with a single click.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this `zearnAutomation` folder

## Usage

### One-Click Full Flow (Recommended)

1. Click the extension icon (purple Z badge)
2. Click **"Run Full Export Flow"**
3. The extension will automatically:
   - Open Zearn in a new tab
   - Fill in login credentials and sign in
   - If 2FA is required, complete it (extension waits)
   - Navigate to Exports Center
   - Select "Student Progress: By student"
   - Set dates: yesterday → today
   - Click Download

### Manual Steps (Alternative)

If you prefer to run steps separately:

1. **Fill Login Only**: Navigate to zearn.org, click extension, click "Fill Login Only"
2. **Export Only**: Navigate to exports page, click extension, click "Export Only"

## Files

- `manifest.json` - Extension configuration
- `background.js` - Handles page navigation and automation flow
- `popup.html` - Extension popup UI
- `popup.js` - Button handlers and injected scripts
- `icon*.png` - Purple Z badge icons

## Configuration

Edit credentials in both `popup.js` and `background.js`:

```javascript
const CONFIG = {
  email: 'eburnside@schools.nyc.gov',
  password: 'AlexRules!'
};
```

Edit URLs in `background.js`:

```javascript
const URLS = {
  login: 'https://www.zearn.org/',
  exports: 'https://www.zearn.org/reports/exports_center/308'
};
```

## How It Works

The extension uses a background service worker that:

1. Listens for the "Run Full Flow" button click
2. Creates a new tab with the login URL
3. Monitors tab URL changes via `chrome.tabs.onUpdated`
4. Injects scripts at the right time based on current URL
5. Automatically navigates to exports after login succeeds

## Troubleshooting

- **Extension not working**: Check the browser console (right-click extension icon → "Inspect popup") and the service worker console (chrome://extensions → "service worker")
- **2FA stuck**: Complete 2FA manually - the extension will continue automatically after
- **Download button disabled**: The date pickers may not have been set correctly - try manual mode
