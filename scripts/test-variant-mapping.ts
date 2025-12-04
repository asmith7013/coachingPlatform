/**
 * Test script to verify the question variant mapping integration
 */

import {
  getQuestionVariantInfo,
  isRootQuestion,
  isVariantQuestion,
  getRootQuestionId,
  mapQuestionsToVariantInfo,
  getQuestionStats
} from '../src/lib/utils/question-variant-mapping';

console.log('🧪 Testing Question Variant Mapping\n');
console.log('='.repeat(80));

// Test 1: Check a known root question (from the analysis output)
console.log('\n📋 Test 1: Root Question (23716)');
const root23716 = getQuestionVariantInfo(23716);
console.log('Question 23716:', root23716);
console.log('Is root?', isRootQuestion(23716));
console.log('Is variant?', isVariantQuestion(23716));

// Test 2: Check a known variant (from the analysis output)
console.log('\n📋 Test 2: Variant Question (23741)');
const variant23741 = getQuestionVariantInfo(23741);
console.log('Question 23741:', variant23741);
console.log('Is root?', isRootQuestion(23741));
console.log('Is variant?', isVariantQuestion(23741));
console.log('Root question ID:', getRootQuestionId(23741));

// Test 3: Map an assignment's questions (simulating assignment 19350)
console.log('\n📋 Test 3: Mapping Assignment Questions');
const assignmentQuestions = [23715, 23716, 23717, 23718, 23719, 23720];
const mapped = mapQuestionsToVariantInfo(assignmentQuestions);
console.log('\nMapped questions:');
mapped.forEach(q => {
  console.log(`  Q${q.questionNumber} (ID: ${q.questionId}):`, {
    isRoot: q.isRoot,
    rootQuestionId: q.rootQuestionId || 'N/A',
    variantNumber: q.variantNumber || 'N/A'
  });
});

// Test 4: Get statistics
console.log('\n📋 Test 4: Question Statistics');
const stats = getQuestionStats(assignmentQuestions);
console.log('Stats for assignment questions:', stats);

// Test 5: Map a mix of root and variant questions
console.log('\n📋 Test 5: Mixed Root and Variant Questions');
const mixedQuestions = [
  23716, // root
  23741, // variant of 23716
  23742, // variant of 23716
  23717, // root
  23746, // variant of 23717
];
const mixedMapped = mapQuestionsToVariantInfo(mixedQuestions);
console.log('\nMapped mixed questions:');
mixedMapped.forEach(q => {
  console.log(`  Q${q.questionNumber} (ID: ${q.questionId}):`, {
    isRoot: q.isRoot,
    rootQuestionId: q.rootQuestionId || 'N/A',
    variantNumber: q.variantNumber || 'N/A'
  });
});

const mixedStats = getQuestionStats(mixedQuestions);
console.log('\nStats for mixed questions:', mixedStats);

console.log('\n' + '='.repeat(80));
console.log('✅ All tests completed!\n');
