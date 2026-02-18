import { MODEL_FOR_TASK } from "./models";

/**
 * Claude API client for processing HTML content into structured markdown
 * Follows established error handling patterns from existing integrations
 */
class ClaudeClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = "https://api.anthropic.com/v1/messages";
    this.apiKey = process.env.ANTHROPIC_API_KEY || "";

    if (!this.apiKey) {
      console.warn("ANTHROPIC_API_KEY environment variable is not set");
    }
  }

  /**
   * Process HTML content into structured markdown using Claude
   *
   * @param htmlContent Raw HTML content to process
   * @param lessonMetadata Optional lesson metadata for context
   * @returns Processed markdown content
   */
  async processLessonContent(
    htmlContent: string,
    lessonMetadata?: {
      url: string;
      grade: string;
      unit: string;
      lesson: string;
      lessonNumber?: number;
    },
  ): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error("Claude API key is not configured");
      }

      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(htmlContent, lessonMetadata);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL_FOR_TASK.PROCESSING,
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: userPrompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Claude API Error (${response.status}): ${errorData.error?.message || response.statusText}`,
        );
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`Claude API Error: ${result.error.message}`);
      }

      return result.content[0].text;
    } catch (error) {
      console.error("Claude API Request Error:", error);
      throw error;
    }
  }

  /**
   * Build the system prompt with processing instructions
   */
  private buildSystemPrompt(): string {
    return `You are an expert at processing HTML content from Illustrative Mathematics lessons into structured markdown. Follow these requirements exactly:

### Processing Priority for Mathematical Content
1. **Screen Reader Text (Highest Priority)** - Always check for screen reader text first in MathJax elements
2. **Alt Text for Images/Graphs (High Priority)** - Check alt attributes in img tags and figure elements  
3. **Plain Text Interpretation (Fallback Only)** - Only interpret MathJax SVG when no screen reader or alt text available

### Output Structure Requirements
Transform scraped content into exactly these sections:
- **Title Format**: \`## Lesson [Number]\` (H2 heading)
- **Lesson URL**: \`**Lesson URL:** [Grade X - Unit Y - Section Z - Lesson N](lesson-url)\`
- **Canvas**: Include canvas images first, then descriptive text about visual elements students see
- **Question Text**: The actual task/question with mathematical expressions in plain text
- **Acceptance Criteria**: Essential criteria only - list minimum requirements a student must meet to be marked correct

### Mathematical Notation Guidelines
- **Fractions**: Use \`1/2\`, \`3/4\`, etc. (not LaTeX syntax)
- **Exponents**: Use \`x^2\`, \`2^n\`, etc.
- **Operations**: Use \`+\`, \`-\`, \`*\`, \`/\` in plain text
- **When in doubt**: Use the most readable plain text format

### Error Handling
- When mathematical content is unclear: **[NEEDS MANUAL REVIEW - unclear MathJax]**
- When visual elements lack descriptions: **[NEEDS MANUAL REVIEW - missing alt text]**
- When structure is ambiguous: **[NEEDS MANUAL REVIEW - unclear section boundaries]**

Return only the processed markdown content, no additional commentary.`;
  }

  /**
   * Build the user prompt with HTML content and metadata
   */
  private buildUserPrompt(
    htmlContent: string,
    lessonMetadata?: {
      url: string;
      grade: string;
      unit: string;
      lesson: string;
      lessonNumber?: number;
    },
  ): string {
    let prompt =
      "Process this HTML content from an Illustrative Mathematics lesson:\n\n";

    if (lessonMetadata) {
      prompt += `**Lesson Context:**
- URL: ${lessonMetadata.url}
- Grade: ${lessonMetadata.grade}
- Unit: ${lessonMetadata.unit}
- Lesson: ${lessonMetadata.lesson}
${lessonMetadata.lessonNumber ? `- Lesson Number: ${lessonMetadata.lessonNumber}` : ""}

`;
    }

    prompt += `**HTML Content:**
\`\`\`html
${htmlContent}
\`\`\`

Process this content according to the system instructions and return the structured markdown.`;

    return prompt;
  }
}

// Export a singleton instance following the established pattern
export const claudeClient = new ClaudeClient();
