import { load } from 'cheerio';
import TurndownService from 'turndown';
import { CooldownParser } from './types';

// Type aliases for cleaner code
type CheerioRoot = ReturnType<typeof load>;

export class SimplifiedCooldownParser {
  private turndownService: TurndownService;
  
  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
    
    // Add custom rule for math placeholders
    this.turndownService.addRule('mathPlaceholder', {
      filter: (node) => node.classList && node.classList.contains('math-placeholder'),
      replacement: (content) => content
    });
  }

  /**
   * Extract raw HTML sections for Claude processing
   */
  private extractRawHtmlSections($: CheerioRoot): {
    studentTaskStatement_rawHtml: string;
    studentResponse_rawHtml: string;
  } {
    // Extract Student Task Statement raw HTML
    const taskSection = $('.im-c-highlight').first();
    const studentTaskStatement_rawHtml = taskSection.length > 0 ? taskSection.html() || '' : '';

    // Extract Student Response raw HTML
    const responseHeading = $('h3').filter((_: number, elem: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      return $(elem).text().toLowerCase().includes('student response');
    });
    
    let studentResponse_rawHtml = '';
    if (responseHeading.length > 0) {
      // Get the heading and all content until next h3
      const responseContent = responseHeading.nextUntil('h3').addBack();
      studentResponse_rawHtml = responseContent.map((_: number, el: any) => $.html(el)).get().join(''); // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    return {
      studentTaskStatement_rawHtml,
      studentResponse_rawHtml
    };
  }

  /**
   * Generate formatted Claude export text
   */
  private generateClaudeExportText(
    lessonMeta: { grade: string; unit: string; section: string; lesson: string },
    rawHtml: { studentTaskStatement_rawHtml: string; studentResponse_rawHtml: string },
    screenshotRefs: Array<{ filename: string; type: string; markdownReference: string }>,
    lessonUrl?: string
  ): string {
    const lessonTitle = `Grade ${lessonMeta.grade} - Unit ${lessonMeta.unit} - Section ${lessonMeta.section.toUpperCase()} - Lesson ${lessonMeta.lesson}`;
    
    let output = `# ${lessonTitle}\n\n`;
    
    // Add lesson URL if provided
    if (lessonUrl) {
      output += `**Lesson URL:** [${lessonTitle}](${lessonUrl})\n\n`;
    }
    
    // Add Student Task Statement
    output += `## Student Task Statement\n\n`;
    if (rawHtml.studentTaskStatement_rawHtml) {
      output += '```html\n';
      output += rawHtml.studentTaskStatement_rawHtml;
      output += '\n```\n\n';
    }
    
    // Add task screenshots
    const taskScreenshots = screenshotRefs.filter(ref => ref.type === 'task');
    if (taskScreenshots.length > 0) {
      output += `### Task Screenshots\n\n`;
      taskScreenshots.forEach(ref => {
        output += `${ref.markdownReference}\n\n`;
      });
    }
    
    // Add Student Response
    output += `## Student Response\n\n`;
    if (rawHtml.studentResponse_rawHtml) {
      output += '```html\n';
      output += rawHtml.studentResponse_rawHtml;
      output += '\n```\n\n';
    }
    
    // Add response screenshots
    const responseScreenshots = screenshotRefs.filter(ref => ref.type === 'response');
    if (responseScreenshots.length > 0) {
      output += `### Response Screenshots\n\n`;
      responseScreenshots.forEach(ref => {
        output += `${ref.markdownReference}\n\n`;
      });
    }
    
    // Add other screenshots (images, full)
    const otherScreenshots = screenshotRefs.filter(ref => ['image', 'full'].includes(ref.type));
    if (otherScreenshots.length > 0) {
      output += `### Additional Screenshots\n\n`;
      otherScreenshots.forEach(ref => {
        output += `${ref.markdownReference}\n\n`;
      });
    }
    
    return output;
  }

  /**
   * Enhanced parsing method with Claude export support
   */
  parseCooldownSectionWithClaudeExport(
    html: string, 
    enableClaudeExport: boolean = false,
    lessonMeta?: { grade: string; unit: string; section: string; lesson: string },
    screenshots?: string[],
    lessonUrl?: string
  ): CooldownParser {
    const $ = load(html);
    const result = this.parseCooldownSection(html);

    if (enableClaudeExport && lessonMeta) {
      // Extract raw HTML sections
      const rawHtml = this.extractRawHtmlSections($);
      
      // Process screenshot references
      const screenshotRefs = (screenshots || []).map(filename => {
        let type: 'task' | 'response' | 'image' | 'full' = 'full';
        
        if (filename.includes('task')) type = 'task';
        else if (filename.includes('response')) type = 'response';
        else if (filename.includes('image')) type = 'image';
        
        return {
          filename,
          type,
          markdownReference: `![${filename}](/screenshots/${filename})`
        };
      });

      // Generate formatted Claude export with URL
      const formattedForClaude = this.generateClaudeExportText(
        lessonMeta, 
        rawHtml, 
        screenshotRefs,
        lessonUrl
      );

      result.claudeExport = {
        studentTaskStatement_rawHtml: rawHtml.studentTaskStatement_rawHtml,
        studentResponse_rawHtml: rawHtml.studentResponse_rawHtml,
        screenshotReferences: screenshotRefs,
        formattedForClaude
      };
    }

    return result;
  }

  /**
   * Main parsing method for cooldown sections
   * Transforms HTML into the three core outputs needed for summer project
   */
  parseCooldownSection(html: string): CooldownParser {
    const $ = load(html);
    const result: CooldownParser = {
      canvas: { images: [] },
      questionText: '',
      acceptanceCriteria: '',
      detectedMath: [],
      title: 'Cool-down',
      hasMathContent: false,
      requiresManualReview: false
    };

    // Extract basic metadata
    result.title = this.extractTitle($) || 'Cool-down';
    result.duration = this.extractDuration($);

    // Extract Student Task Statement (Question Text + Canvas)
    const taskStatement = this.extractStudentTaskStatement($);
    if (taskStatement) {
      result.questionText = taskStatement.text;
      result.canvas.images = taskStatement.images;
      result.detectedMath.push(...taskStatement.math);
    }

    // Extract Student Response (Acceptance Criteria)
    const studentResponse = this.extractStudentResponse($);
    if (studentResponse) {
      result.acceptanceCriteria = studentResponse.text;
      result.detectedMath.push(...studentResponse.math);
    }

    // Set metadata flags
    result.hasMathContent = result.detectedMath.length > 0;
    result.requiresManualReview = result.detectedMath.length > 0;

    return result;
  }

  private extractTitle($: CheerioRoot): string {
    const title = $('.im-c-card-heading__title').first().text().trim();
    return title || 'Cool-down';
  }

  private extractDuration($: CheerioRoot): string | undefined {
    const duration = $('.im-c-icon-heading__title').first().text().trim();
    return duration || undefined;
  }

  private extractStudentTaskStatement($: CheerioRoot) {
    // Look for the highlighted task statement section
    const taskSection = $('.im-c-highlight').first();
    if (taskSection.length === 0) return null;

    const $clone = taskSection.clone();
    
    // Extract images first
    const images: Array<{url: string; alt: string}> = [];
    $clone.find('img').each((_: number, img: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const $img = $(img);
      const url = $img.attr('src') || '';
      const alt = $img.attr('alt') || $img.attr('data-uw-rm-alt-original') || '';
      if (url) {
        images.push({ url, alt });
      }
    });

    // Process math content and replace with placeholders
    const math = this.processMathContent($clone, 'questionText', $);
    
    // Convert to clean markdown
    const text = this.turndownService.turndown($clone.html() || '').trim();

    return { text, images, math };
  }

  private extractStudentResponse($: CheerioRoot) {
    // Find the "Student Response" heading
    const responseHeading = $('h3').filter((_: number, elem: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      return $(elem).text().toLowerCase().includes('student response');
    });

    if (responseHeading.length === 0) return null;

    // Get content between this heading and the next heading
    const responseContainer = responseHeading.nextUntil('h3');
    if (responseContainer.length === 0) return null;

    const $clone = $('<div>').append(responseContainer.clone());

    // Process math content and replace with placeholders
    const math = this.processMathContent($clone, 'acceptanceCriteria', $);
    
    // Convert to clean markdown
    const text = this.turndownService.turndown($clone.html() || '').trim();

    return { text, math };
  }

  private processMathContent(
    $container: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    section: 'questionText' | 'acceptanceCriteria',
    $: CheerioRoot // Main Cheerio instance for element wrapping
  ) {
    const mathItems: Array<{
      section: 'questionText' | 'acceptanceCriteria';
      rawHtml: string;
      screenreaderText?: string;
      placeholder: string;
      mathIndex: number;
    }> = [];

    // Find all possible math elements with various selectors
    const mathSelectors = [
      '.math',
      '.inline-math', 
      '[data-mathjax-span]',
      '[data-mathjax-div]',
      'svg[role="img"]',
      '.MathJax',
      '.MathJax_Display',
      '.MJXc-display',
      'math',
      'mrow'
    ];

    $container.find(mathSelectors.join(', ')).each((index: number, elem: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const $elem = $(elem); // FIXED: Use the main $ function passed as parameter
      const rawHtml = $elem.prop('outerHTML') || '';
      
      // Look for screenreader content in various places
      let screenreaderText: string | undefined;
      
      // Check within the element
      const screenreaderElement = $elem.find('.screenreader-only, .sr-only, [aria-label]').first();
      if (screenreaderElement.length > 0) {
        screenreaderText = screenreaderElement.text().trim() || screenreaderElement.attr('aria-label');
      } else {
        // Check sibling elements
        const nearbyScreenreader = $elem.siblings('.screenreader-only, .sr-only').first();
        if (nearbyScreenreader.length > 0) {
          screenreaderText = nearbyScreenreader.text().trim();
        }
        // Check for aria-label on the element itself
        const ariaLabel = $elem.attr('aria-label');
        if (ariaLabel) {
          screenreaderText = ariaLabel;
        }
      }

      const placeholder = `[Math Expression ${index + 1}]`;
      
      mathItems.push({
        section,
        rawHtml,
        screenreaderText,
        placeholder,
        mathIndex: index
      });

      // Replace with placeholder for clean text extraction
      $elem.replaceWith(`<span class="math-placeholder">${placeholder}</span>`);
    });

    return mathItems;
  }
}

/**
 * Enhanced convenience function for parsing cooldown content with Claude export support
 * @param html - Raw HTML content of the cooldown section
 * @param enableClaudeExport - Whether to enable Claude export mode
 * @param lessonMeta - Lesson metadata for Claude export
 * @param screenshots - Screenshot filenames for Claude export
 * @param lessonUrl - Original lesson URL for Claude export
 * @returns Parsed cooldown data with three core outputs and optional Claude export
 */
export function parseCooldown(
  html: string, 
  enableClaudeExport?: boolean,
  lessonMeta?: { grade: string; unit: string; section: string; lesson: string },
  screenshots?: string[],
  lessonUrl?: string
): CooldownParser {
  const parser = new SimplifiedCooldownParser();
  return parser.parseCooldownSectionWithClaudeExport(html, enableClaudeExport, lessonMeta, screenshots, lessonUrl);
}
