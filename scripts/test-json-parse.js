const fs = require('fs');

console.log('Reading assignment.json...');

// Read file
const content = fs.readFileSync('docs/assignment.json', 'utf-8');

try {
  const data = JSON.parse(content);

  console.log('✅ Parsed successfully!');
  console.log(`Total assignments: ${data.data.length}`);

  // Count questions
  let totalQuestions = 0;
  let d3Questions = 0;

  for (const assignment of data.data) {
    for (const aq of assignment.assignment_questions) {
      totalQuestions++;
      if (aq.questions.questionContent.type === 'd3') {
        d3Questions++;
      }
    }
  }

  console.log(`Total questions: ${totalQuestions}`);
  console.log(`D3 questions: ${d3Questions}`);

} catch (err) {
  console.log(`❌ Error: ${err.message}`);
}
