# Instructions for Claude: Interpreting IM Lesson Scraper Output

## Overview
You will receive HTML content from Illustrative Mathematics lessons that needs to be converted into three structured sections: Canvas, Question Text, and Acceptance Criteria. Your goal is to create clean, readable markdown that captures the essential learning content.

## Processing Priority for Mathematical Content

### 1. Screen Reader Text (Highest Priority)
- **ALWAYS check for screen reader text first** in MathJax elements
- Look for `aria-label`, `.sr-only`, `.screenreader-only` attributes/classes
- When screen reader text exists, use it directly as it's already vetted and accurate
- Example: If you find `aria-label="one half"`, use "one half" in your output

### 2. Alt Text for Images/Graphs (High Priority)
- Check `alt` attributes in `<img>` tags and figure elements
- Use alt text to describe visual mathematical content (graphs, tables, diagrams)
- This provides essential context for visual elements that students see

### 3. Plain Text Interpretation (Fallback Only)
- Only interpret MathJax SVG when no screen reader or alt text is available
- **Convert to plain text notation**: `1/2` for fractions, `x^2` for exponents, etc.
- **Avoid LaTeX/markdown math syntax** (`$\frac{1}{2}$`) as it doesn't render properly in Notion
- When uncertain, mark as **[NEEDS MANUAL REVIEW]**

## Output Structure

Transform the scraped content into exactly these four sections:

### **Lesson Reference**
- **Purpose**: Provide direct access to the original lesson
- **Content**: Clickable link to the lesson on Illustrative Mathematics
- **Format**: `**Lesson URL:** [Grade X - Unit Y - Section Z - Lesson N](lesson-url)`

### Canvas
- **Purpose**: Describe the starting state and visual elements students see
- **Content**: Images, diagrams, graphs, initial problem setup
- **Source**: Extract from figures, images, and visual MathJax elements
- **Format**: Descriptive text using alt text and screen reader content when available

### Question Text  
- **Purpose**: Text transcription of what students read and see
- **Content**: The actual task/question with mathematical expressions converted to readable text
- **Source**: Student Task Statement section from HTML
- **Format**: Clean prose with mathematical expressions in plain text notation
- **IMPORTANT**: For visual elements, include detailed image descriptions formatted as **"Image Description for Visual Accessibility:"**

### Acceptance Criteria
- **Purpose**: What constitutes correct student responses for grading
- **Content**: Expected answers, sample reasoning, acceptable approaches
- **Source**: Student Response section from HTML  
- **Format**: Bullet points for key criteria + sample responses from IM answer key
- **IMPORTANT**: Start with specific points AI should look for, then include sample responses

## Processing Instructions

### Mathematical Content Handling (Notion-Compatible)
1. **Check for screen reader text** → Use directly if found
2. **Check for alt text** → Use for visual context if available  
3. **Interpret MathJax SVG** → Convert to plain text only (e.g., `1/2`, `x^2`)
4. **Never use LaTeX syntax** → Avoid `$\frac{1}{2}$`, `$x^2$` as these don't render in Notion
5. **Mark unclear content** → `**[NEEDS MANUAL REVIEW]**` when uncertain

### Mathematical Notation Guidelines
- **Fractions**: Use `1/2`, `3/4`, etc. (not `$\frac{1}{2}$`)
- **Exponents**: Use `x^2`, `2^n`, etc. (not `$x^2$`)
- **Operations**: Use `+`, `-`, `*`, `/` in plain text
- **Equations**: Write as `1 + 1 + 1 + 1/2 + 1/2 = 4`
- **When in doubt**: Use the most readable plain text format

### Visual Content Enhancement
- **Create detailed image descriptions** when alt text is minimal or missing
- **Use "Image Description for Visual Accessibility:" header** for visual descriptions
- **Include spatial relationships** (above/below, left/right, positioning)
- **Describe shapes, lines, labels** with precision
- **Explain the mathematical relationship** the visual demonstrates

### Content Organization
- **Include lesson URL**: Always start with the lesson reference link
- **Maintain lesson context**: Include grade/unit/lesson info at top
- **Preserve mathematical accuracy**: Don't simplify correct mathematical language
- **Use standard markdown**: Headers (#), lists (-), emphasis (*) - NO math syntax
- **Flag uncertainties**: Mark any content you're not confident about

### Quality Control
- **Indicate source**: Note when using screen reader vs. your interpretation
- **Preserve structure**: Maintain numbered lists, ordered steps from original
- **Focus on pedagogy**: Emphasize what students should learn and demonstrate
- **Test Notion compatibility**: Ensure all formatting will paste cleanly

## Example Output Format

```markdown
# Grade 8 - Unit 1 - Lesson 2

**Lesson URL:** [Grade 8 - Unit 1 - Lesson 2](https://accessim.org/6-8/grade-8/unit-1/section-a/lesson-2?a=teacher)

## Canvas
### Canvas Screenshot:

### Canvas Description: 
Two identical polygon shapes positioned on opposite sides of a dashed diagonal line.

## Question Text  
What type of move takes Figure A to Figure B?
Explain your reasoning.

**Image Description for Visual Accessibility:**
The image shows two identical polygon shapes positioned on opposite sides of a dashed diagonal line (labeled with the letter ℓ).
* **Figure A** is a polygon located above and to the right of the dashed line. It appears to be an irregular pentagon (5-sided shape) with one side that angles inward, creating a concave portion.
* **Figure B** is an identical polygon located below and to the left of the dashed line. It has the exact same shape as Figure A.
* **The dashed line ℓ** runs diagonally through the image from upper left to lower right, separating the two figures.

The two polygons are positioned as mirror images of each other across the dashed line. If you were to fold the paper along the dashed line ℓ, Figure A would exactly match up with Figure B. This suggests that Figure B is a reflection of Figure A across line ℓ.

## Acceptance Criteria
* Student identifies a valid move that takes Figure A to Figure B
* Student explains reasoning (see acceptable sample responses below)

Sample responses:
* The move is 1 rotation. If Figure A is turned around the point shared by Figures A and B, it can land on Figure B.
* The move is 2 reflections. If Figure A is flipped over line ℓ and then flipped over again so that the shared points and angle line up, then it can land on Figure B.
```

## Key Formatting Guidelines

### For Question Text:
- Include the actual question text first
- Add **"Image Description for Visual Accessibility:"** as a bold header
- Provide detailed spatial and mathematical descriptions
- Use bullet points for multiple visual elements
- Bold key figure/element names (**Figure A**, **Figure B**, etc.)

### For Acceptance Criteria:
- Start with bullet points of what AI should specifically look for
- Include phrase "see acceptable sample responses below" when sample responses follow
- List sample responses exactly as they appear in IM answer key
- Maintain original formatting and mathematical language
- Use plain text for all mathematical expressions

## Notion Compatibility Requirements
- **No LaTeX math syntax**: Never use `$...$` notation
- **Plain text math only**: Use `1/2`, `x^2`, `2 + 3 = 5`
- **Standard markdown only**: Headers, lists, bold, italic
- **Test paste-ability**: All content should paste cleanly into Notion without formatting errors

## Error Handling
- When mathematical content is unclear: **[NEEDS MANUAL REVIEW - unclear MathJax]**
- When visual elements lack descriptions: **[NEEDS MANUAL REVIEW - missing alt text]**  
- When structure is ambiguous: **[NEEDS MANUAL REVIEW - unclear section boundaries]**

## Success Criteria
Your output should be ready to paste directly into Notion and provide coaches with:
- **Direct access** to the original lesson (URL)
- **Clean rendering**: All mathematical content in plain text that displays correctly
- Clear understanding of what students see (Canvas)
- Exact task requirements (Question Text) with detailed visual descriptions
- Grading guidelines (Acceptance Criteria) with specific AI criteria and sample responses
- **Perfect Notion compatibility**: No formatting errors when pasted

---

**Key Updates:**
1. **Notion compatibility focus** - emphasis on plain text mathematical notation
2. **Explicit prohibition** of LaTeX math syntax (`$...$`)
3. **Clear mathematical formatting guidelines** for fractions, exponents, equations
4. **Enhanced success criteria** including paste-ability testing