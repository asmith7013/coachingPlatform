"use server";

// NOTE: maxDuration for server actions is set in the page's route segment config
// See: src/app/scm/workedExamples/create/page.tsx

import Anthropic from '@anthropic-ai/sdk';
import { handleAnthropicError } from '@error/handlers/anthropic';
import { MODEL_FOR_TASK } from '@/lib/api/integrations/claude/models';
import {
  ANALYZE_PROBLEM_SYSTEM_PROMPT,
  buildAnalyzePrompt,
} from '../lib/prompts';
import type { AnalyzeResponse, ProblemAnalysis, StrategyDefinition, Scenario } from '../lib/types';

interface AnalyzeProblemInput {
  imageUrl: string;
  gradeLevel: string;
  unitNumber: number | null;
  lessonNumber: number | null;
  lessonName: string;
  learningGoals: string[];
  // Optional additional context
  additionalImageUrls?: string[];
  additionalContext?: string;
}

/**
 * Fetch image and convert to base64
 */
async function imageUrlToBase64(url: string): Promise<{ base64: string; mediaType: string }> {
  console.log('[imageUrlToBase64] Fetching image from URL...');
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'image/png';
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  console.log('[imageUrlToBase64] Image fetched, size:', arrayBuffer.byteLength, 'bytes');
  return { base64, mediaType: contentType };
}

/**
 * Analyze a mastery check question image using Claude's vision capability
 */
export async function analyzeProblem(input: AnalyzeProblemInput): Promise<AnalyzeResponse> {
  console.log('[analyzeProblem] Starting analysis...');
  console.log('[analyzeProblem] Input:', {
    imageUrl: input.imageUrl?.substring(0, 50) + '...',
    gradeLevel: input.gradeLevel,
    unitNumber: input.unitNumber,
    lessonNumber: input.lessonNumber,
    lessonName: input.lessonName,
    learningGoals: input.learningGoals,
    additionalImageCount: input.additionalImageUrls?.length || 0,
    hasAdditionalContext: !!input.additionalContext,
  });

  try {
    const { imageUrl, gradeLevel, unitNumber, lessonNumber, lessonName, learningGoals, additionalImageUrls, additionalContext } = input;

    if (!imageUrl) {
      console.log('[analyzeProblem] Error: No image URL provided');
      return {
        success: false,
        error: 'No image URL provided',
      };
    }

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log('[analyzeProblem] API key present:', !!apiKey);
    console.log('[analyzeProblem] API key prefix:', apiKey?.substring(0, 10) + '...');

    if (!apiKey) {
      console.error('[analyzeProblem] ANTHROPIC_API_KEY not found in environment');
      return {
        success: false,
        error: 'ANTHROPIC_API_KEY not configured',
      };
    }

    // Fetch and convert main image to base64
    const { base64, mediaType } = await imageUrlToBase64(imageUrl);

    // Fetch additional images if provided
    const additionalImagesBase64: { base64: string; mediaType: string }[] = [];
    if (additionalImageUrls && additionalImageUrls.length > 0) {
      console.log('[analyzeProblem] Fetching', additionalImageUrls.length, 'additional images...');
      for (const url of additionalImageUrls) {
        try {
          const imgData = await imageUrlToBase64(url);
          additionalImagesBase64.push(imgData);
        } catch (err) {
          console.warn('[analyzeProblem] Failed to fetch additional image:', url, err);
        }
      }
    }

    const anthropic = new Anthropic({
      apiKey,
      timeout: 10 * 60 * 1000, // 10 minutes
    });

    const userPrompt = buildAnalyzePrompt(gradeLevel, unitNumber, lessonNumber, lessonName, learningGoals, additionalContext);
    console.log('[analyzeProblem] User prompt built, length:', userPrompt.length);

    // Build message content with main image + additional images
    const messageContent: Anthropic.MessageCreateParams['messages'][0]['content'] = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: base64,
        },
      },
    ];

    // Add additional images as reference (labeled)
    additionalImagesBase64.forEach((img, index) => {
      messageContent.push({
        type: 'text',
        text: `\n[Reference Image ${index + 1}]:`,
      });
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: img.base64,
        },
      });
    });

    // Add the text prompt
    messageContent.push({
      type: 'text',
      text: userPrompt,
    });

    console.log('[analyzeProblem] Calling Claude Opus API with streaming +', messageContent.filter(c => c.type === 'image').length, 'images...');
    const startTime = Date.now();

    // Use Opus 4.5 for this complex multi-step analysis task
    // Opus 4.5 excels at: following detailed instructions, multi-step reasoning, accuracy
    // Use stream: true to handle long-running requests (required by SDK for high max_tokens)
    // See: https://github.com/anthropics/anthropic-sdk-typescript#long-requests
    const stream = await anthropic.messages.create({
      model: MODEL_FOR_TASK.ANALYSIS,
      max_tokens: 8000,
      stream: true,
      system: ANALYZE_PROBLEM_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: messageContent,
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
    console.log('[analyzeProblem] Claude API response received in', elapsed, 'ms');
    console.log('[analyzeProblem] Response text length:', fullText.length);

    // Parse JSON from response
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('[analyzeProblem] Error: Could not parse JSON');
      console.log('[analyzeProblem] Raw response:', fullText.substring(0, 500));
      return {
        success: false,
        error: 'Could not parse JSON from response',
      };
    }

    console.log('[analyzeProblem] Parsing JSON...');
    const parsed = JSON.parse(jsonMatch[0]) as {
      problemAnalysis: ProblemAnalysis;
      strategyDefinition: StrategyDefinition;
      scenarios: Scenario[];
    };

    // Sanitize any fields that should be strings but might be objects (defensive against LLM errors)
    // This prevents React error #31 "Objects are not valid as a React child"
    const sanitizeStringField = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      return JSON.stringify(value);
    };

    // Sanitize scenarios - ensure text fields are strings
    if (parsed.scenarios && Array.isArray(parsed.scenarios)) {
      parsed.scenarios = parsed.scenarios.map(scenario => ({
        ...scenario,
        name: sanitizeStringField(scenario.name),
        context: sanitizeStringField(scenario.context),
        themeIcon: sanitizeStringField(scenario.themeIcon),
        numbers: sanitizeStringField(scenario.numbers),
        description: sanitizeStringField(scenario.description),
      }));
    }

    // Validate required fields
    if (!parsed.problemAnalysis || !parsed.strategyDefinition || !parsed.scenarios) {
      console.log('[analyzeProblem] Error: Missing required fields');
      console.log('[analyzeProblem] Has problemAnalysis:', !!parsed.problemAnalysis);
      console.log('[analyzeProblem] Has strategyDefinition:', !!parsed.strategyDefinition);
      console.log('[analyzeProblem] Has scenarios:', !!parsed.scenarios);
      return {
        success: false,
        error: 'Response missing required fields',
      };
    }

    // Validate that Scenario 1 has diagramEvolution (required for slide generation)
    if (!parsed.scenarios[0]?.diagramEvolution) {
      console.log('[analyzeProblem] Error: Scenario 1 missing diagramEvolution');
      return {
        success: false,
        error: 'Scenario 1 is missing diagramEvolution. Please re-analyze the problem.',
      };
    }

    console.log('[analyzeProblem] Success! Strategy:', parsed.strategyDefinition.name);
    console.log('[analyzeProblem] Scenarios count:', parsed.scenarios.length);
    console.log('[analyzeProblem] Scenario 1 has diagramEvolution:', !!parsed.scenarios[0]?.diagramEvolution);
    console.log('[analyzeProblem] Has diagramPreview (legacy):', !!parsed.problemAnalysis.diagramPreview);
    if (parsed.scenarios[0]?.diagramEvolution) {
      console.log('[analyzeProblem] diagramEvolution.initialState length:', parsed.scenarios[0].diagramEvolution.initialState?.length || 0);
      console.log('[analyzeProblem] diagramEvolution.keyElements count:', parsed.scenarios[0].diagramEvolution.keyElements?.length || 0);
      console.log('[analyzeProblem] diagramEvolution.steps count:', parsed.scenarios[0].diagramEvolution.steps?.length || 0);
    }

    return {
      success: true,
      data: {
        problemAnalysis: parsed.problemAnalysis,
        strategyDefinition: parsed.strategyDefinition,
        scenarios: parsed.scenarios,
      },
    };
  } catch (error) {
    console.error('[analyzeProblem] Error:', error);
    return {
      success: false,
      error: handleAnthropicError(error, 'Analyze problem'),
    };
  }
}
