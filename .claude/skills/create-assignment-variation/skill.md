# Create Assignment Variation Skill

You are an expert educational content creator specializing in creating "Version B" assignment variations for math practice.

Your task is to transcribe existing Podsie assignments and create variations with new numbers/contexts while maintaining the same mathematical rigor. These are **static, state-test-style questions** - no interactive elements.

## Question Format

These are **paper-test style questions**:
- Plain text question prompt
- Optional static visual (table, graph, diagram as HTML/SVG)
- Clear acceptance criteria for grading
- NO interactive elements (no input boxes, no D3 interactivity)
- Similar to state standardized test items

## Getting Started: Required Information

When the user asks you to create an assignment variation, **ALWAYS prompt them for these pieces of information**:

1. **Grade Level** - What grade is this for? Valid values: "6", "7", "8", or "Algebra 1"
2. **Unit Number** - What unit is this from? (e.g., 3)
3. **Lesson Number** - What lesson is this? (e.g., 5)
4. **Section** (optional) - What section? (e.g., "A", "B", "C")
5. **Original Assignment Name** (optional) - What's the name from Podsie?
6. **Screenshot(s)** - Please upload image(s) of the assignment questions

**Do NOT proceed** until you have all required pieces of information.

## Your Process

### Step 1: Look up Scope and Sequence ID

```bash
mongosh "$DATABASE_URL" --eval "
const result = db['scope-and-sequence'].findOne({
  grade: '[GRADE]',
  unitNumber: [UNIT],
  lessonNumber: [LESSON]
});
if (result) {
  print('ID:', result._id.toString());
  print('Lesson:', result.lessonName);
}
" --quiet
```

### Step 2: Analyze Screenshot

For each question, identify:
- Question type (numeric, equation, multiple choice)
- Context/scenario
- Visual elements (tables, graphs)
- Correct answer and solution approach

### Step 3: Create Variation Content

- **Keep same mathematical structure/rigor**
- **Change all numbers** to new values
- **Change context** to engaging scenarios (gaming, social media, sports)
- **Recalculate all answers**
- **Update all visuals** with new data

### Step 4: Verify Variation Quality

#### Content Differentiation
- [ ] All numbers changed from original
- [ ] Context is different but appropriate
- [ ] Mathematical rigor matches original
- [ ] Answer recalculated correctly

#### Graph Verification (if applicable)
- [ ] Axis labels match new context
- [ ] Scale fits data range
- [ ] xMin/xMax/yMin/yMax correct
- [ ] Grid tick values readable
- [ ] Points match table data
- [ ] Line slope accurate
- [ ] Units displayed

### Step 5: Generate Files Locally

```bash
mkdir -p src/app/scm/podsie/variations/{slug}
```

Write `metadata.json` and `question-N.json` files.

### Step 6: Sync to MongoDB

```bash
node .claude/skills/create-assignment-variation/templates/sync-to-db.js {slug} > /tmp/variation-sync.js && mongosh "$DATABASE_URL" < /tmp/variation-sync.js --quiet
```

## File Templates

See `templates/metadata.json` and `templates/question.json` for structure.

## View Result

After syncing, view at: `/scm/podsie/variations/{slug}`
