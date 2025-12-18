# Generate Slides Prompt

This prompt is used when generating HTML slides from the analysis.
Both CLI and browser contexts use this same instruction set.

---

## Step-by-Step Slide Generation Process

**You MUST follow this exact sequence when generating slides.**

### STEP 1: Review Your Inputs
Before generating ANY slides, verify you have:
- [ ] Problem analysis with step-by-step solution
- [ ] Strategy name and one-sentence summary
- [ ] Strategy moves (2-3 verbs that appear in slide headers)
- [ ] CFU question templates referencing strategy verbs
- [ ] Three scenarios with DIFFERENT contexts

### STEP 2: Plan the Slide Structure
Create slides in this EXACT order:

| # | Type | Template | Content |
|---|------|----------|---------|
| 1 | Learning Goal | Dark theme | Strategy name + one-sentence summary |
| 2 | Problem Setup | Dark theme | Scenario 1 introduction + visual |
| 3 | Step 1 ASK | CFU Toggle | Visual + CFU question about strategy |
| 4 | Step 1 REVEAL | Answer Toggle | Visual + step completed + explanation |
| 5 | Step 2 ASK | CFU Toggle | Updated visual + CFU question |
| 6 | Step 2 REVEAL | Answer Toggle | Updated visual + step completed |
| 7-8 | (Optional Steps) | Toggle templates | If strategy has 3 moves |
| 9 | Practice 1 | Dark theme, NO scaffold | Scenario 2 - problem setup ONLY |
| 10 | Practice 2 | Dark theme, NO scaffold | Scenario 3 - problem setup ONLY |
| 11 | Printable | WHITE theme | ALL practice problems in ONE slide |

### STEP 3: Apply Critical Rules

**Rule 1: Visual Stability (NON-NEGOTIABLE)**
- Keep main visual (table/diagram) in the SAME position across slides 2-6
- Add annotations AROUND the stationary element
- Mimic a teacher at a whiteboard: problem stays put, annotations appear

**Rule 2: Two-Slide Rule (NON-NEGOTIABLE)**
- NEVER show a question and its answer on the same slide
- ASK slide → mental commitment → REVEAL slide

**Rule 3: Scaffolding Removal (NON-NEGOTIABLE)**
- Slides 2-6: Maximum scaffolding (step headers, CFU, highlighting)
- Practice slides 9-10: ZERO scaffolding (just problem setup, dark theme)
- Students must apply strategy independently

**Rule 4: CFU Questions Reference Strategy**
- ✅ "Why did I [VERB] first?" (strategy question)
- ✅ "How did I know to [VERB] here?" (decision-making question)
- ❌ "What is 6 ÷ 2?" (computation question)
- ❌ "What's the answer?" (result question)

**Rule 5: Consistent Step Names**
- Use EXACT verbs from strategyDefinition.moves throughout
- Slide headers: "STEP 1: [VERB]", "STEP 2: [VERB]"
- CFU questions reference these exact verbs

---

## CRITICAL: Printable Worksheet Rules

The FINAL slide MUST follow these rules EXACTLY:

**Structure:**
1. ALL practice problems go in ONE slide file with multiple `print-page` divs
2. Each `print-page` div = one printed page (8.5in x 11in with 0.5in padding)
3. NEVER create separate slides for each practice problem

**Styling (DIFFERENT from dark theme slides):**
4. Use white background (#ffffff) and black text (#000000)
5. Use Times New Roman font for printability
6. Include `overflow-y: auto` on slide-container
7. Include `flex-shrink: 0` on each print-page div

**Content:**
8. Include ONLY: Header (lesson title, unit/lesson, name/date), Learning Goal box, Problem content
9. DO NOT add: Strategy reminders, hints, scaffolding - students apply strategy independently

**CSS (REQUIRED):**
10. MUST include `@media print` styles
11. MUST include `@page { size: letter portrait; margin: 0; }`
12. MUST include `page-break-after: always` on each print-page

---

## Completion Checklist (Verify Before Finishing)

- [ ] Learning Goal slide uses strategy name and one-sentence summary
- [ ] Visual stays in SAME position across slides 2-6
- [ ] All step headers use EXACT verbs from strategy moves
- [ ] CFU questions reference strategy verbs (not computation)
- [ ] Practice slides (9-10) have ZERO scaffolding
- [ ] Printable slide uses WHITE background, black text, Times New Roman
- [ ] Printable slide has ALL practice problems in ONE file with print-page divs
- [ ] Printable slide includes @media print CSS with page-break rules
