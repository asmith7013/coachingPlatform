/**
 * Context-specific variations for CLI vs Browser execution.
 *
 * This module defines the differences between how the worked example
 * skill operates in CLI mode (Claude Code) vs Browser mode (web app).
 */

export type ExecutionContext = 'cli' | 'browser';

/**
 * CLI-specific instructions for Claude Code skill
 */
export const CLI_CONTEXT = {
  /**
   * How slides are saved in CLI mode
   */
  slideOutput: `
## CLI Output Instructions

1. Create a folder: src/app/presentations/{slug}/
2. Write each slide as slide-{N}.html
3. Create metadata.json with deck information
4. Run sync-to-db.js to save to MongoDB
5. Create .worked-example-progress.json for resumption
`,

  /**
   * How to verify slides in CLI mode
   */
  verification: `
## CLI Verification

Run the verification script after generating slides:
\`\`\`bash
npx tsx .claude/skills/create-worked-example-sg/scripts/verify-worked-example.ts {slug}
\`\`\`
`,

  /**
   * How to save to database in CLI mode
   */
  databaseSync: `
## CLI Database Sync

Use mongosh to sync to MongoDB:
\`\`\`bash
node .claude/skills/create-worked-example-sg/scripts/sync-to-db.js {slug}
\`\`\`
`,
};

/**
 * Browser-specific instructions for web app
 */
export const BROWSER_CONTEXT = {
  /**
   * How slides are saved in browser mode
   */
  slideOutput: `
## Browser Output Instructions

1. Return slides as JSON array of HTML strings
2. Each slide should be a complete HTML document
3. Separate slides with ===SLIDE_SEPARATOR=== delimiter
4. The browser UI will parse and store in React state
`,

  /**
   * How to verify slides in browser mode
   */
  verification: `
## Browser Verification

Slides are validated client-side:
1. Zod schema validation for structure
2. Visual preview in iframe
3. User review before saving
`,

  /**
   * How to save to database in browser mode
   */
  databaseSync: `
## Browser Database Sync

Use the saveWorkedExampleDeck server action:
\`\`\`typescript
import { saveWorkedExampleDeck } from '@/app/actions/worked-examples/save-deck';
const result = await saveWorkedExampleDeck(deckData);
\`\`\`
`,
};

/**
 * Get context-specific instructions based on execution environment
 */
export function getContextInstructions(context: ExecutionContext) {
  return context === 'cli' ? CLI_CONTEXT : BROWSER_CONTEXT;
}

/**
 * Common instructions that apply to both contexts
 */
export const COMMON_INSTRUCTIONS = {
  /**
   * Required inputs for slide generation
   */
  requiredInputs: [
    'Grade level (6, 7, 8, or Algebra 1)',
    'Unit number (optional)',
    'Lesson number (optional)',
    'Learning goals (optional)',
    'Mastery check question image',
  ],

  /**
   * Quality checklist for both contexts
   */
  qualityChecklist: `
## Quality Checklist

**Strategy & Analysis:**
- ✅ Problem was deeply analyzed BEFORE creating any content
- ✅ ONE clear strategy is named and defined
- ✅ Strategy has a one-sentence student-facing summary
- ✅ All step names use consistent verbs from the strategy definition
- ✅ CFU questions reference the strategy name or step names
- ✅ User confirmed understanding before slide creation began

**Content:**
- ✅ All required user inputs captured (learning goal, grade level, problem image)
- ✅ 3 scenarios all use the SAME strategy (not different approaches)
- ✅ First problem has 2-3 steps with Ask/Reveal pairs
- ✅ CFU questions ask "why/how" not "what"
- ✅ Practice problems can be solved using the exact same steps

**Visual:**
- ✅ Visual elements stay in same position across slides 2-6
- ✅ Practice slides have zero scaffolding
- ✅ All math is accurate
- ✅ HTML is valid and properly styled
`,
};
