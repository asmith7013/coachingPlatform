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

Transform the scraped content into exactly these sections:

### Title Format
- **Format**: `## Lesson [Number]` (H2 heading)
- **Example**: `## Lesson 2`, `## Lesson 8`

### Lesson URL
- **Format**: `**Lesson URL:** [Grade X - Unit Y - Section Z - Lesson N](lesson-url)`

### Canvas
- **Header**: `### Canvas` (H3)
- **Content**: Include canvas images first, then descriptive text about visual elements students see
- **Purpose**: Describe the starting state and visual elements students see

### Question Text  
- **Header**: `### Question Text` (H3)
- **Content**: The actual task/question with mathematical expressions in plain text
- **Images**: Include detailed descriptions with **"Image Description:"** header
- **Format**: `![Image Description](image-source-url)` when source URLs available

### Acceptance Criteria
- **Header**: `### Acceptance Criteria` (H3)
- **Content**: **Essential criteria only** - list the minimum requirements a student must meet to be marked correct
- **Source**: Extract criteria directly from the IM sample responses - identify what mathematical elements are consistently present across all acceptable answers
- **Format**: Start with 2-4 key criteria that are objectively measurable, then include sample responses for reference only
- **Focus**: What must be present vs. what would be nice to have
- **Universal requirement**: Each criterion should end with "with mathematically sound reasoning"
- **Method flexibility**: When multiple valid solution methods exist, include "or an alternative, mathematically sound method" in acceptance criteria to allow for different approaches while maintaining mathematical rigor

## Mathematical Notation Guidelines
- **Fractions**: Use `1/2`, `3/4`, etc. (not `$\frac{1}{2}$`)
- **Exponents**: Use `x^2`, `2^n`, etc. (not `$x^2$`)
- **Operations**: Use `+`, `-`, `*`, `/` in plain text
- **Equations**: Write as `1 + 1 + 1 + 1/2 + 1/2 = 4`
- **When in doubt**: Use the most readable plain text format

## Image Handling
- **Extract `src` attributes** from `<img>` tags in HTML
- **Format as markdown images**: `![alt-text](source-url)`
- **Place after text descriptions**: Always include text description first, then image link
- **Use descriptive alt text**: Pull from existing alt attributes or screenreader content
- **Handle missing sources gracefully**: If no `src` attribute, proceed without image link

## Visual Content Enhancement
- **Create detailed image descriptions** when alt text is minimal or missing
- **Use "Image Description:" header** for visual descriptions
- **Include spatial relationships** (above/below, left/right, positioning)
- **Describe shapes, lines, labels** with precision
- **Explain the mathematical relationship** the visual demonstrates
- **Always include image source links** when `src` attributes are present in HTML

## Example Output Format

```markdown
## Lesson 8

**Lesson URL:** [Grade 6 - Unit 1 - Section C - Lesson 8](https://accessim.org/6-8/grade-6/unit-1/section-c/lesson-8?a=teacher)

### Canvas
![Screenshot of triangle Q with student solutions](attachment:screenshot.png)
Three images of triangle Q showing different student approaches to finding area.

### Question Text  
Elena, Lin, and Noah all found the area of Triangle Q to be 14 square units but reasoned about it differently, as shown in the diagrams. Explain at least one student's way of thinking and why his or her answer is correct.

**Image Description:** Three images of triangle Q labeled Elena, Lin, and Noah. Elena's triangle has two additional triangles next to it to compose a rectangle, Lin's triangle has a copy of the same triangle composed into a parallelogram, and Noah's triangle shows the top portion of the triangle cut off and moved next to the bottom portion to create a parallelogram.

![Three images of triangle Q labeled Elena, Lin, and Noah](https://cms-assets.illustrativemathematics.org/9f01nauu7p99y5jxdter54gutj59)

### Acceptance Criteria
- Student explains at least one student's approach correctly with mathematically sound reasoning
- Student justifies why the chosen approach gives the correct answer with mathematically sound reasoning

**Sample responses:**
- Elena drew two rectangles that decomposed the triangle into two right triangles. She found the area of each right triangle to be half of the area of its enclosing rectangle. This means that the area of the original triangle is the sum of half of the area of the rectangle on the left and half of the rectangle on the right. Half of (4 × 5) plus half of (4 × 2) is 10 + 4, so the area is 14 square units.
- Lin saw it as half of a parallelogram with the base of 7 units and height of 4 units (and thus an area of 28 square units). Half of 28 is 14.
- Noah decomposed the triangle by cutting it at half of the triangle's height, turning the top triangle around, and joining it with the bottom trapezoid to make a parallelogram. He then calculated the area of that parallelogram, which has the same base length but half the height of the triangle. 7 × 2 = 14, so the area is 14 square units.
```

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
- Grading guidelines (Acceptance Criteria) with specific AI criteria and verbatim sample responses
- **Perfect Notion compatibility**: No formatting errors when pasted, images display properly