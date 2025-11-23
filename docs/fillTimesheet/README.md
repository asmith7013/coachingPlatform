# Timecard Auto-Filler Chrome Extension

This Chrome extension automatically fills out your daily timecard form with predefined tasks and hours.

## Installation

1. Create icon files (or use placeholders):
   - You need three icon files: `icon16.png`, `icon48.png`, and `icon128.png`
   - You can create simple colored squares or download icons
   - Place them in this directory

2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `fillTimesheet` folder

## Usage

1. Open your timecard form page
2. Click the extension icon in your browser toolbar
3. Click "Fill Timecard" button
4. The extension will automatically:
   - Fill in the task dropdown
   - Fill in the project dropdown
   - Enter the hours
   - Add a new row
   - Repeat for the second entry

## Configuration

Edit the `entries` array in `popup.js` to customize your tasks:

```javascript
const entries = [
  {
    task: "Lead coaching activities: 1-1 coaching sessions, micro group PL, or walkthrough",
    project: "PH_Studio Classroom Project",
    hours: 6
  },
  {
    task: "Content Development",
    project: "PH_Studio Classroom Project",
    hours: 2.5
  }
];
```

## Notes

- Review the form before submitting to ensure accuracy
- The extension waits 300-500ms between actions to allow the page to update
- Make sure the task and project names match exactly as they appear in the dropdowns
