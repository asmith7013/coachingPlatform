"use server";

import Anthropic from '@anthropic-ai/sdk';
import { handleServerError } from '@error/handlers/server';
import {
  GENERATE_SLIDES_SYSTEM_PROMPT,
  buildGenerateSlidesPrompt,
} from '../lib/prompts';
import type { GenerateSlidesResponse, ProblemAnalysis, StrategyDefinition, Scenario } from '../lib/types';
import type { HtmlSlide } from '@zod-schema/worked-example-deck';

interface GenerateSlidesInput {
  gradeLevel: string;
  unitNumber: number | null;
  lessonNumber: number | null;
  learningGoals: string[];
  problemAnalysis: ProblemAnalysis;
  strategyDefinition: StrategyDefinition;
  scenarios: Scenario[];
}

/**
 * Generate HTML slides for a worked example
 */
export async function generateSlides(input: GenerateSlidesInput): Promise<GenerateSlidesResponse> {
  console.log('[generateSlides] Starting slide generation...');

  try {
    const {
      gradeLevel,
      unitNumber,
      lessonNumber,
      learningGoals,
      problemAnalysis,
      strategyDefinition,
      scenarios,
    } = input;

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('[generateSlides] ANTHROPIC_API_KEY not found');
      return {
        success: false,
        error: 'ANTHROPIC_API_KEY not configured',
      };
    }

    const anthropic = new Anthropic({
      apiKey,
      timeout: 10 * 60 * 1000, // 10 minutes
    });

    const userPrompt = buildGenerateSlidesPrompt(
      gradeLevel,
      unitNumber,
      lessonNumber,
      learningGoals,
      problemAnalysis,
      strategyDefinition,
      scenarios
    );

    console.log('[generateSlides] Calling Claude API with streaming...');
    const startTime = Date.now();

    // Use stream: true for long-running requests (required by SDK for high max_tokens)
    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 32000,
      stream: true,
      system: GENERATE_SLIDES_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Collect streamed text
    let fullText = '';
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullText += event.delta.text;
      }
    }

    const elapsed = Date.now() - startTime;
    console.log('[generateSlides] Claude API response received in', elapsed, 'ms');
    console.log('[generateSlides] Response text length:', fullText.length);

    // Parse slides from response using separator
    const slideHtmls = parseSlides(fullText);

    if (slideHtmls.length === 0) {
      return {
        success: false,
        error: 'No slides found in response',
      };
    }

    // Convert to HtmlSlide format
    const slides: HtmlSlide[] = slideHtmls.map((html, index) => ({
      slideNumber: index + 1,
      htmlContent: html,
      visualType: detectVisualType(html),
      scripts: extractScripts(html),
    }));

    return {
      success: true,
      data: { slides },
    };
  } catch (error) {
    console.error('Error generating slides:', error);
    return {
      success: false,
      error: handleServerError(error, 'Failed to generate slides'),
    };
  }
}

/**
 * Parse slides from Claude's response
 */
function parseSlides(text: string): string[] {
  // Split by the separator we specified in the prompt
  const separator = '===SLIDE_SEPARATOR===';

  if (text.includes(separator)) {
    return text
      .split(separator)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.includes('<'));
  }

  // Fallback: try to split by HTML document patterns
  // Look for complete HTML blocks
  const htmlBlocks: string[] = [];
  const regex = /<div[^>]*class="slide-container"[^>]*>[\s\S]*?(?=<div[^>]*class="slide-container"|$)/gi;
  let match;

  while ((match = regex.exec(text)) !== null) {
    htmlBlocks.push(match[0].trim());
  }

  if (htmlBlocks.length > 0) {
    return htmlBlocks;
  }

  // Last resort: return the whole text as one slide
  if (text.includes('<')) {
    return [text.trim()];
  }

  return [];
}

/**
 * Detect visual type from HTML content
 */
function detectVisualType(html: string): 'html' | 'p5' | 'd3' {
  const lower = html.toLowerCase();

  if (lower.includes('p5.js') || lower.includes('createcanvas') || lower.includes('p5cdn')) {
    return 'p5';
  }

  if (lower.includes('d3.js') || lower.includes('d3.select') || lower.includes('d3cdn')) {
    return 'd3';
  }

  return 'html';
}

/**
 * Extract script references from HTML
 */
function extractScripts(html: string): { type: 'cdn' | 'inline'; content: string }[] | undefined {
  const scripts: { type: 'cdn' | 'inline'; content: string }[] = [];

  // Match script tags
  const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    const attrs = match[1];
    const content = match[2].trim();

    // Check if it's a CDN script (has src attribute)
    const srcMatch = attrs.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      scripts.push({ type: 'cdn', content: srcMatch[1] });
    } else if (content) {
      scripts.push({ type: 'inline', content });
    }
  }

  return scripts.length > 0 ? scripts : undefined;
}
