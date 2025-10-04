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
- **IMPORTANT**: For visual elements, include detailed image descriptions formatted as **"Image Description:"**

### Acceptance Criteria
- **Purpose**: What constitutes correct student responses for grading
- **Content**: Expected answers, sample reasoning, acceptable approaches
- **Source**: Student Response section from HTML  
- **Format**: Bullet points for key criteria + sample responses from IM answer key
- **IMPORTANT**: Start with specific points AI should look for, then include sample responses

## Processing Instructions

### Image Source Link Handling
- **ALWAYS check for `src` attributes** in `<img>` tags within figures
- **Include image source links** when available using format: `![Image Description](image-source-url)`
- **Place image links** immediately after the text description of the image
- **Example format**: 
  ```markdown
  **Image Description:**
  Three images of triangle Q labeled Elena, Lin, and Noah...
  
  ![Three images of triangle Q](https://cms-assets.illustrativemathematics.org/9f01nauu7p99y5jxdter54gutj59)
  ```

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
- **Use "Image Description:" header** for visual descriptions
- **Include spatial relationships** (above/below, left/right, positioning)
- **Describe shapes, lines, labels** with precision
- **Explain the mathematical relationship** the visual demonstrates
- **Always include image source links** when `src` attributes are present in HTML

### Content Organization
- **Include lesson URL**: Always start with the lesson reference link
- **Maintain lesson context**: Include grade/unit/lesson info at top
- **Preserve mathematical accuracy**: Don't simplify correct mathematical language
- **Use standard markdown**: Headers (#), lists (-), emphasis (*) - NO math syntax
- **Flag uncertainties**: Mark any content you're not confident about
- **Include image links**: Add markdown image links when source URLs are available

### Quality Control
- **Indicate source**: Note when using screen reader vs. your interpretation
- **Preserve structure**: Maintain numbered lists, ordered steps from original
- **Focus on pedagogy**: Emphasize what students should learn and demonstrate
- **Test Notion compatibility**: Ensure all formatting will paste cleanly
- **Verify image links**: Check that image source URLs are properly formatted

## Example Output Format

```markdown
# Grade 6 - Unit 1 - Section C - Lesson 8

**Lesson URL:** [Grade 6 - Unit 1 - Section C - Lesson 8](https://accessim.org/6-8/grade-6/unit-1/section-c/lesson-8?a=teacher)

## Canvas
### Canvas Description: 
Three images of triangle Q showing different student approaches to finding area.

## Question Text  
Elena, Lin, and Noah all found the area of Triangle Q to be 14 square units but reasoned about it differently, as shown in the diagrams. Explain at least one student's way of thinking and why his or her answer is correct.

**Image Description:**
Three images of triangle Q labeled Elena, Lin, and Noah. Elena's triangle has two additional triangles next to it to compose a rectangle, Lin's triangle has a copy of the same triangle composed into a parallelogram, and Noah's triangle shows the top portion of the triangle cut off and moved next to the bottom portion to create a parallelogram.

![Three images of triangle Q labeled Elena, Lin, and Noah](https://cms-assets.illustrativemathematics.org/9f01nauu7p99y5jxdter54gutj59)

## Acceptance Criteria
* Student explains at least one student's approach correctly
* Student justifies why the chosen approach gives the correct answer (see acceptable sample responses below)

Sample responses:
* Elena drew two rectangles that decomposed the triangle into two right triangles. She found the area of each right triangle to be half of the area of its enclosing rectangle. This means that the area of the original triangle is the sum of half of the area of the rectangle on the left and half of the rectangle on the right. Half of (4 × 5) plus half of (4 × 2) is 10 + 4, so the area is 14 square units.
* Lin saw it as half of a parallelogram with the base of 7 units and height of 4 units (and thus an area of 28 square units). Half of 28 is 14.
* Noah decomposed the triangle by cutting it at half of the triangle's height, turning the top triangle around, and joining it with the bottom trapezoid to make a parallelogram. He then calculated the area of that parallelogram, which has the same base length but half the height of the triangle. 7 × 2 = 14, so the area is 14 square units.
```

## Key Formatting Guidelines

### For Question Text:
- Include the actual question text first
- Add **"Image Description:"** as a bold header
- Provide detailed spatial and mathematical descriptions
- **Include image source link** immediately after description using `![alt text](src-url)` format
- Use bullet points for multiple visual elements
- Bold key figure/element names (**Figure A**, **Figure B**, etc.)

### For Acceptance Criteria:
- Start with bullet points of what AI should specifically look for
- Include phrase "see acceptable sample responses below" when sample responses follow
- List sample responses exactly as they appear in IM answer key
- Maintain original formatting and mathematical language
- Use plain text for all mathematical expressions

### For Image Handling:
- **Extract `src` attributes** from `<img>` tags in HTML
- **Format as markdown images**: `![alt-text](source-url)`
- **Place after text descriptions**: Always include text description first, then image link
- **Use descriptive alt text**: Pull from existing alt attributes or screenreader content
- **Handle missing sources gracefully**: If no `src` attribute, proceed without image link

## Notion Compatibility Requirements
- **No LaTeX math syntax**: Never use `$...$` notation
- **Plain text math only**: Use `1/2`, `x^2`, `2 + 3 = 5`
- **Standard markdown only**: Headers, lists, bold, italic, images
- **Test paste-ability**: All content should paste cleanly into Notion without formatting errors
- **Image links render properly**: Markdown image syntax should display correctly in Notion

## Error Handling
- When mathematical content is unclear: **[NEEDS MANUAL REVIEW - unclear MathJax]**
- When visual elements lack descriptions: **[NEEDS MANUAL REVIEW - missing alt text]**  
- When structure is ambiguous: **[NEEDS MANUAL REVIEW - unclear section boundaries]**
- When image sources are missing: **[NEEDS MANUAL REVIEW - missing image source]**

## Success Criteria
Your output should be ready to paste directly into Notion and provide coaches with:
- **Direct access** to the original lesson (URL)
- **Clean rendering**: All mathematical content in plain text that displays correctly
- **Visual content access**: Direct links to original images from Illustrative Mathematics
- Clear understanding of what students see (Canvas)
- Exact task requirements (Question Text) with detailed visual descriptions
- Grading guidelines (Acceptance Criteria) with specific AI criteria and sample responses
- **Perfect Notion compatibility**: No formatting errors when pasted, images display properly

---

**Key Updates:**
1. **Image source link inclusion** - extract and include `src` URLs from HTML `<img>` tags
2. **Markdown image formatting** - use `![alt](src)` syntax for proper Notion rendering
3. **Strategic placement** - image links follow text descriptions for accessibility
4. **Error handling** - flag missing image sources for manual review
5. **Enhanced success criteria** - includes proper image display in final output