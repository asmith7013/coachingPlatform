import fs from 'fs';
import path from 'path';

interface Question {
  id: number;
  questionContent: {
    questionText: string;
    explanation?: string;
    type: string;
    d3Content?: string;
    acceptanceCriteria?: string;
  };
}

interface AssignmentQuestion {
  questions: Question;
}

interface Assignment {
  assignment_id: number;
  assignment_name: string;
  assignment_questions: AssignmentQuestion[];
}

interface QuestionGroup {
  rootQuestionId: number;
  rootQuestion: Question;
  variants: Array<{
    questionId: number;
    question: Question;
    similarity: number;
  }>;
  normalizedCode: string;
}

// Normalize code by replacing numbers and common variable text
function normalizeCode(code: string): string {
  if (!code) return '';

  return code
    // Replace all numbers with placeholder
    .replace(/\b\d+\.?\d*\b/g, '#NUM#')
    // Replace quoted strings (likely contextual text)
    .replace(/"[^"]*"/g, '"#TEXT#"')
    .replace(/'[^']*'/g, "'#TEXT#'")
    // Remove whitespace variations
    .replace(/\s+/g, ' ')
    .trim();
}

// Calculate similarity ratio between two strings (0 to 1)
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (!str1 || !str2) return 0;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1;

  // Simple character-level similarity
  const editDistance = levenshteinDistance(shorter, longer);
  return (longer.length - editDistance) / longer.length;
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Group questions by similarity
function groupQuestionsByVariants(questions: Question[], similarityThreshold = 0.85): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  const processed = new Set<number>();

  for (const question of questions) {
    if (processed.has(question.id)) continue;

    const normalizedCode = normalizeCode(question.questionContent.d3Content || '');

    // Find similar questions
    const variants: QuestionGroup['variants'] = [];

    for (const otherQuestion of questions) {
      if (otherQuestion.id === question.id || processed.has(otherQuestion.id)) {
        continue;
      }

      const otherNormalizedCode = normalizeCode(otherQuestion.questionContent.d3Content || '');
      const similarity = calculateSimilarity(normalizedCode, otherNormalizedCode);

      if (similarity >= similarityThreshold) {
        variants.push({
          questionId: otherQuestion.id,
          question: otherQuestion,
          similarity
        });
        processed.add(otherQuestion.id);
      }
    }

    // Create group (root is the first question found)
    groups.push({
      rootQuestionId: question.id,
      rootQuestion: question,
      variants,
      normalizedCode
    });

    processed.add(question.id);
  }

  return groups;
}

// Main analysis
async function analyzeQuestionVariants() {
  console.log('🔍 Analyzing question variants from assignment.json...\n');

  const assignmentPath = path.join(process.cwd(), 'docs', 'assignment.json');
  const fileContent = fs.readFileSync(assignmentPath, 'utf-8');

  // Fix encoding issues - replace problematic unicode characters
  const cleanedContent = fileContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  const data = JSON.parse(cleanedContent);

  if (!data.success || !data.data) {
    throw new Error('Invalid assignment data format');
  }

  const assignments: Assignment[] = data.data;

  // Collect all questions
  const allQuestions: Question[] = [];
  for (const assignment of assignments) {
    for (const aq of assignment.assignment_questions) {
      allQuestions.push(aq.questions);
    }
  }

  console.log(`📊 Total questions found: ${allQuestions.length}\n`);

  // Filter to only d3 questions (they have code to compare)
  const d3Questions = allQuestions.filter(q => q.questionContent.type === 'd3' && q.questionContent.d3Content);
  console.log(`📊 D3 questions with code: ${d3Questions.length}\n`);

  // Group by variants
  const groups = groupQuestionsByVariants(d3Questions);

  // Print results
  console.log('═'.repeat(80));
  console.log('VARIANT ANALYSIS RESULTS');
  console.log('═'.repeat(80));
  console.log();

  const groupsWithVariants = groups.filter(g => g.variants.length > 0);
  const standaloneQuestions = groups.filter(g => g.variants.length === 0);

  console.log(`✅ Question groups with variants: ${groupsWithVariants.length}`);
  console.log(`📄 Standalone questions: ${standaloneQuestions.length}\n`);

  // Show detailed groups
  for (const group of groupsWithVariants) {
    console.log('─'.repeat(80));
    console.log(`🌳 ROOT QUESTION ID: ${group.rootQuestionId}`);
    console.log(`   Question: ${group.rootQuestion.questionContent.questionText.substring(0, 100)}...`);
    console.log(`   Variants found: ${group.variants.length}`);
    console.log();

    for (const variant of group.variants) {
      console.log(`   🔀 VARIANT ID: ${variant.questionId} (${(variant.similarity * 100).toFixed(1)}% similar)`);
      console.log(`      Question: ${variant.question.questionContent.questionText.substring(0, 100)}...`);
    }
    console.log();
  }

  // Generate mapping output
  const mapping: Record<number, { type: 'root' | 'variant', rootQuestionId?: number, groupId: number }> = {};

  groups.forEach((group, index) => {
    mapping[group.rootQuestionId] = {
      type: 'root',
      groupId: index
    };

    group.variants.forEach(variant => {
      mapping[variant.questionId] = {
        type: 'variant',
        rootQuestionId: group.rootQuestionId,
        groupId: index
      };
    });
  });

  // Save mapping
  const outputPath = path.join(process.cwd(), 'docs', 'question-variant-mapping.json');
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));

  console.log('═'.repeat(80));
  console.log(`\n✅ Mapping saved to: ${outputPath}`);
  console.log(`\n📈 Summary:`);
  console.log(`   - Total question groups: ${groups.length}`);
  console.log(`   - Groups with variants: ${groupsWithVariants.length}`);
  console.log(`   - Total root questions: ${groups.length}`);
  console.log(`   - Total variant questions: ${groups.reduce((sum, g) => sum + g.variants.length, 0)}`);
}

// Run analysis
analyzeQuestionVariants().catch(console.error);
