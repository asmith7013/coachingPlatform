"use server";

import Anthropic from '@anthropic-ai/sdk';
import { handleServerError } from '@error/handlers/server';
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
  });

  try {
    const { imageUrl, gradeLevel, unitNumber, lessonNumber, lessonName, learningGoals } = input;

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

    // Fetch and convert image to base64
    const { base64, mediaType } = await imageUrlToBase64(imageUrl);

    const anthropic = new Anthropic({
      apiKey,
      timeout: 10 * 60 * 1000, // 10 minutes
    });

    const userPrompt = buildAnalyzePrompt(gradeLevel, unitNumber, lessonNumber, lessonName, learningGoals);
    console.log('[analyzeProblem] User prompt built, length:', userPrompt.length);

    console.log('[analyzeProblem] Calling Claude Opus API with streaming + base64 image...');
    const startTime = Date.now();

    // Use Opus 4.5 for this complex multi-step analysis task
    // Opus 4.5 excels at: following detailed instructions, multi-step reasoning, accuracy
    // Use stream: true to handle long-running requests (required by SDK for high max_tokens)
    // See: https://github.com/anthropics/anthropic-sdk-typescript#long-requests
    const stream = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 8000,
      stream: true,
      system: ANALYZE_PROBLEM_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: base64,
              },
            },
            {
              type: 'text',
              text: userPrompt,
            },
          ],
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

    console.log('[analyzeProblem] Success! Strategy:', parsed.strategyDefinition.name);
    console.log('[analyzeProblem] Scenarios count:', parsed.scenarios.length);

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
      error: handleServerError(error, 'Failed to analyze problem'),
    };
  }
}
