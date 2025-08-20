// Quick test to verify lesson URL is being added to Claude export
const { parseCooldown } = require('./src/app/tools/imScraper/lib/cooldown-parser.ts');

// Mock HTML content
const mockHtml = `
<div class="im-c-highlight">
  <h3>Student Task Statement</h3>
  <p>Test content</p>
</div>
<h3>Student Response</h3>
<p>Response content</p>
`;

// Test lesson metadata
const lessonMeta = {
  grade: '6',
  unit: '1',
  section: 'a',
  lesson: '1'
};

// Test URL
const lessonUrl = 'https://accessim.org/6-8/grade-6/unit-1/section-a/lesson-1?a=teacher';

// Test Claude export with URL
const result = parseCooldown(
  mockHtml,
  true, // enableClaudeExport
  lessonMeta,
  [], // screenshots
  lessonUrl
);

console.log('Claude Export Test:');
console.log('==================');
console.log(result.claudeExport?.formattedForClaude);
