# Completion Checklist

**Verify AFTER all 10 slides are generated.**

---

## All Slides

- [ ] All 10 slides generated (6 worked example + 2 practice previews + 1 printable + 1 lesson summary)
- [ ] Slides 1-8 are exactly 960x540px
- [ ] All text is in `<p>`, `<h1-6>`, `<ul>`, `<ol>` tags (NOT bare text in divs!)
- [ ] Using `.row`/`.col` classes (NOT inline `display: flex`)
- [ ] Web-safe fonts only: Arial, Georgia, Courier New
- [ ] No interactive JavaScript, no onclick, no CSS animations

---

## Content Quality

- [ ] Slide 1 (Teacher Instructions) has Big Idea, Learning Targets, and Strategy
- [ ] Slide 2 (Big Idea) shows Grade/Unit/Lesson and Big Idea statement
- [ ] Step names match STRATEGY DEFINITION exactly
- [ ] CFU questions reference strategy verbs
- [ ] CFU and Answer boxes at same position on same slide (steps 4-6)
- [ ] Visual stays in same position across slides 3-6
- [ ] Each step slide ADDS something new to the visual
- [ ] Problem reminder is at bottom left corner on step slides

---

## PPTX Export

- [ ] CFU/Answer boxes have correct `data-pptx-region` attributes (for animation)
- [ ] CFU box at y=40, Answer box at y=40 (stacked, same position)
- [ ] All key regions have position attributes

---

## Printable Slide (Slide 9)

- [ ] Has zero scaffolding (no step headers, no hints)
- [ ] WHITE background (#ffffff)
- [ ] Times New Roman font
- [ ] Contains BOTH practice problems (from Scenarios 2 & 3)
- [ ] Each problem has work space

---

## Lesson Summary (Slide 10)

- [ ] Has `print-page` CSS class for print detection
- [ ] Contains Big Idea prominently (large text, blue background box)
- [ ] Contains strategy steps as numbered list
- [ ] Includes a visual reference (graph, diagram, or worked example)
- [ ] Has "REMEMBER" key takeaway section (1-2 sentences)
- [ ] Is a single page (NOT multi-page)
- [ ] WHITE background (#ffffff)
- [ ] Times New Roman font (matching printable worksheet)
- [ ] 8.5in × 11in format

---

## If SVG Visual

- [ ] SVG container has `data-pptx-region` and position attributes
- [ ] Scale matches GRAPH PLAN from Part 1 (scenarios[0].graphPlan)
- [ ] Annotations match GRAPH PLAN type and positions
- [ ] Completed SVG Checklist from `04-svg-workflow.md`
- [ ] Each line in its own `data-pptx-layer` group
- [ ] Each annotation in its own `data-pptx-layer` group
- [ ] All `<text>` elements have `font-family="Arial"`
- [ ] Grid lines align with axis labels (same pixel values)
