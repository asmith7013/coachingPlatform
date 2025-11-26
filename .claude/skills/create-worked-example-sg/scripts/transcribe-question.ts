#!/usr/bin/env tsx
/**
 * Transcribe a question from image/PDF to structured format
 *
 * Usage: tsx scripts/transcribe-question.ts <image-path> [options]
 *
 * Example:
 *   tsx scripts/transcribe-question.ts ./docs/question.png --type worked-example
 *   tsx scripts/transcribe-question.ts ./docs/problem.pdf --output ./questions/
 *
 * This script:
 * 1. Reads the image/PDF
 * 2. Uses Claude's vision API to analyze and extract question content
 * 3. Structures it according to the common question format
 * 4. Outputs a ready-to-use question structure
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

interface TranscriptionOptions {
  inputPath: string;
  outputPath?: string;
  questionType?: 'worked-example' | 'd3-interactive' | 'multiple-choice' | 'free-response';
  gradeLevel?: number;
  mathStandard?: string;
  verbose?: boolean;
}

interface QuestionStructure {
  metadata: {
    type: string;
    gradeLevel?: number;
    mathConcept: string;
    mathStandard?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
  content: {
    scenario?: string;
    questionText: string;
    visuals?: {
      type: 'table' | 'diagram' | 'graph' | 'image';
      description: string;
      data?: unknown;
    }[];
    interactiveElements?: {
      type: 'input' | 'button' | 'slider' | 'dropdown';
      label: string;
      purpose: string;
    }[];
  };
  solution: {
    steps: string[];
    answer: string;
    explanation: string;
  };
  acceptanceCriteria: string[];
  commonMisconceptions?: string[];
}

async function loadImage(filePath: string): Promise<{ data: string; mediaType: string }> {
  const ext = path.extname(filePath).toLowerCase();
  const supportedFormats: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };

  const mediaType = supportedFormats[ext];
  if (!mediaType) {
    throw new Error(`Unsupported image format: ${ext}. Supported: ${Object.keys(supportedFormats).join(', ')}`);
  }

  const buffer = await readFile(filePath);
  const base64 = buffer.toString('base64');

  return { data: base64, mediaType };
}

async function transcribeQuestion(options: TranscriptionOptions): Promise<QuestionStructure> {
  const { inputPath, questionType = 'worked-example', gradeLevel, mathStandard, verbose } = options;

  if (verbose) {
    console.log(`📸 Loading image: ${inputPath}`);
  }

  const { data, mediaType } = await loadImage(inputPath);

  if (verbose) {
    console.log(`🤖 Analyzing with Claude Vision API...`);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable not set');
  }

  const client = new Anthropic({ apiKey });

  const systemPrompt = `You are an expert math educator analyzing educational content.

Your task is to extract and structure a math question from an image into a standardized JSON format.

The question type is: ${questionType}

${gradeLevel ? `The target grade level is: ${gradeLevel}` : ''}
${mathStandard ? `The relevant math standard is: ${mathStandard}` : ''}

Extract the following information:

1. **Metadata**:
   - mathConcept (e.g., "Proportional Relationships", "Solving Linear Equations")
   - mathStandard (Common Core or state standard, if identifiable)
   - difficulty (easy/medium/hard based on grade level appropriateness)

2. **Content**:
   - scenario: Any real-world context or story setup
   - questionText: The exact question being asked
   - visuals: Describe any tables, diagrams, graphs, or images shown
   - interactiveElements: If this is an interactive question, describe controls

3. **Solution**:
   - steps: Array of step-by-step solution process
   - answer: The final answer
   - explanation: Why this approach works

4. **Acceptance Criteria**:
   - What conditions define a correct student response?
   - What variations of the answer should be accepted?

5. **Common Misconceptions**:
   - Typical errors students might make
   - Incorrect reasoning to watch for

Return ONLY valid JSON matching this structure. Be precise and detailed.`;

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data,
            },
          },
          {
            type: 'text',
            text: systemPrompt,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API');
  }

  // Extract JSON from response (may be wrapped in markdown code blocks)
  let jsonText = content.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  const questionStructure: QuestionStructure = JSON.parse(jsonText);

  // Add grade level if provided
  if (gradeLevel) {
    questionStructure.metadata.gradeLevel = gradeLevel;
  }

  if (mathStandard) {
    questionStructure.metadata.mathStandard = mathStandard;
  }

  return questionStructure;
}

function generateMarkdown(question: QuestionStructure): string {
  const { metadata, content, solution, acceptanceCriteria, commonMisconceptions } = question;

  let md = `# Question\n\n`;

  // Metadata
  md += `## Metadata\n\n`;
  md += `- **Type**: ${metadata.type}\n`;
  if (metadata.gradeLevel) md += `- **Grade Level**: ${metadata.gradeLevel}\n`;
  md += `- **Math Concept**: ${metadata.mathConcept}\n`;
  if (metadata.mathStandard) md += `- **Standard**: ${metadata.mathStandard}\n`;
  if (metadata.difficulty) md += `- **Difficulty**: ${metadata.difficulty}\n`;
  md += `\n`;

  // Content
  md += `## Content\n\n`;

  if (content.scenario) {
    md += `**Scenario:**\n${content.scenario}\n\n`;
  }

  md += `**Question:**\n${content.questionText}\n\n`;

  if (content.visuals && content.visuals.length > 0) {
    md += `**Visuals:**\n`;
    content.visuals.forEach((visual, idx) => {
      md += `${idx + 1}. ${visual.type}: ${visual.description}\n`;
    });
    md += `\n`;
  }

  if (content.interactiveElements && content.interactiveElements.length > 0) {
    md += `**Interactive Elements:**\n`;
    content.interactiveElements.forEach((elem, idx) => {
      md += `${idx + 1}. ${elem.type}: ${elem.label} - ${elem.purpose}\n`;
    });
    md += `\n`;
  }

  // Solution
  md += `## Solution\n\n`;
  md += `**Steps:**\n`;
  solution.steps.forEach((step, idx) => {
    md += `${idx + 1}. ${step}\n`;
  });
  md += `\n**Answer:** ${solution.answer}\n\n`;
  md += `**Explanation:**\n${solution.explanation}\n\n`;

  // Acceptance Criteria
  md += `## Acceptance Criteria\n\n`;
  acceptanceCriteria.forEach((criterion, idx) => {
    md += `- ${criterion}\n`;
  });
  md += `\n`;

  // Common Misconceptions
  if (commonMisconceptions && commonMisconceptions.length > 0) {
    md += `## Common Misconceptions\n\n`;
    commonMisconceptions.forEach((misconception, idx) => {
      md += `- ${misconception}\n`;
    });
    md += `\n`;
  }

  return md;
}

function generateYAML(question: QuestionStructure): string {
  return `type: ${question.metadata.type}
math_concept: "${question.metadata.mathConcept}"
${question.metadata.mathStandard ? `math_standard: "${question.metadata.mathStandard}"` : ''}
${question.metadata.gradeLevel ? `grade_level: ${question.metadata.gradeLevel}` : ''}
${question.metadata.difficulty ? `difficulty: ${question.metadata.difficulty}` : ''}
`;
}

async function saveOutput(question: QuestionStructure, outputPath: string) {
  await mkdir(outputPath, { recursive: true });

  // Save JSON
  const jsonPath = path.join(outputPath, 'question-structure.json');
  await writeFile(jsonPath, JSON.stringify(question, null, 2), 'utf-8');
  console.log(`✅ Saved JSON: ${jsonPath}`);

  // Save Markdown
  const mdPath = path.join(outputPath, 'question-contents.md');
  const markdown = generateMarkdown(question);
  await writeFile(mdPath, markdown, 'utf-8');
  console.log(`✅ Saved Markdown: ${mdPath}`);

  // Save YAML metadata
  const yamlPath = path.join(outputPath, 'question.yml');
  const yaml = generateYAML(question);
  await writeFile(yamlPath, yaml, 'utf-8');
  console.log(`✅ Saved YAML: ${yamlPath}`);
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
📸 Question Transcription Tool

Usage: tsx scripts/transcribe-question.ts <image-path> [options]

Examples:
  tsx scripts/transcribe-question.ts ./docs/question.png
  tsx scripts/transcribe-question.ts ./docs/problem.jpg --output ./questions/001/
  tsx scripts/transcribe-question.ts ./image.png --type d3-interactive --grade 7

Options:
  --output <path>           Output directory (default: ./transcribed-questions/)
  --type <type>             Question type: worked-example, d3-interactive, multiple-choice, free-response
  --grade <level>           Grade level (6-12)
  --standard <code>         Math standard (e.g., "7.RP.A.1")
  --verbose, -v             Verbose output
  --help, -h                Show this help

Environment Variables:
  ANTHROPIC_API_KEY         Required for Claude Vision API

Output Files:
  question-structure.json   Complete structured data
  question-contents.md      Human-readable markdown
  question.yml              YAML metadata
    `);
    process.exit(0);
  }

  const options: TranscriptionOptions = {
    inputPath: args[0],
    outputPath: './transcribed-questions/',
    questionType: 'worked-example',
  };

  // Parse options
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--output':
      case '-o':
        options.outputPath = args[++i];
        break;
      case '--type':
      case '-t':
        options.questionType = args[++i] as TranscriptionOptions['questionType'];
        break;
      case '--grade':
      case '-g':
        options.gradeLevel = parseInt(args[++i], 10);
        break;
      case '--standard':
      case '-s':
        options.mathStandard = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
    }
  }

  // Verify input file exists
  if (!fs.existsSync(options.inputPath)) {
    console.error(`❌ File not found: ${options.inputPath}`);
    process.exit(1);
  }

  console.log(`\n🔍 Transcribing question from: ${options.inputPath}\n`);

  try {
    const question = await transcribeQuestion(options);

    if (options.verbose) {
      console.log(`\n📋 Extracted Question Structure:\n`);
      console.log(JSON.stringify(question, null, 2));
    }

    if (options.outputPath) {
      await saveOutput(question, options.outputPath);
      console.log(`\n✨ Transcription complete! Files saved to: ${options.outputPath}\n`);
    }
  } catch (error) {
    console.error(`\n❌ Error during transcription:`);
    if (error instanceof Error) {
      console.error(error.message);
      if (options.verbose && error.stack) {
        console.error(error.stack);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
