/**
 * HTML templates for PPTX-compatible worked example slides.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/
 * To update: Edit the HTML files in the source folder, then run:
 *   npx tsx scripts/sync-skill-content.ts
 *
 * PPTX CONSTRAINTS (from pptx.md):
 * - Dimensions: 960×540px (fixed)
 * - Fonts: Arial, Georgia only (no custom fonts)
 * - Layout: .row/.col classes (no inline flexbox)
 * - Theme: Light (white background, dark text)
 * - No JavaScript, no onclick, no animations
 *
 * Shared between:
 * - CLI skill: .claude/skills/create-worked-example-sg/
 * - Browser creator: src/app/scm/workedExamples/create/
 */

/**
 * Base slide template - Foundation for all slides
 * 960×540px, light theme, Arial font
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-base.html
 */
export const SLIDE_BASE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!--
    ============================================================
    PPTX EXPORT DATA ATTRIBUTES
    ============================================================
    Each region has data-pptx-* attributes for reliable export:
    - data-pptx-region: region type (badge, title, subtitle, content, footnote)
    - data-pptx-x, y, w, h: position and size in pixels (960x540 coordinate system)
    ============================================================
  -->

  <!-- Title Zone: 0-110px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Step Badge -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div data-pptx-region="badge"
           data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"
           style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">{{step_badge}}</p>
      </div>
    </div>
    <!-- Main Title -->
    <h1 data-pptx-region="title"
        data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"
        style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">{{title}}</h1>
    <!-- Subtitle/Instruction -->
    <p data-pptx-region="subtitle"
       data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"
       style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">{{subtitle}}</p>
  </div>

  <!-- Content Zone: 130-500px (370px height) -->
  <div data-pptx-region="content"
       data-pptx-x="20" data-pptx-y="130" data-pptx-w="920" data-pptx-h="370"
       class="fill-height col" style="padding: 10px 20px;">
    {{content}}
  </div>

  <!-- Footnote (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

</body>
</html>
`;

/**
 * Slide with CFU (Check for Understanding) box visible
 * Used for step slides where CFU is revealed
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-with-cfu.html
 */
export const SLIDE_WITH_CFU_TEMPLATE = `
<!--
  ============================================================
  REFERENCE EXAMPLE: Slide with CFU Box (TOP RIGHT OVERLAY)
  ============================================================
  ⚠️  DO NOT use this template to generate new slides!

  HOW TO CREATE A CFU SLIDE (slides 4, 8, 12):
  1. COPY the ENTIRE previous slide verbatim (slide 3, 7, or 11)
  2. Find the closing </body> tag
  3. INSERT the CFU box IMMEDIATELY BEFORE </body>
  4. Change NOTHING else - not even a single character

  The CFU box to insert (ABSOLUTE POSITIONED TOP RIGHT):
  <div data-pptx-region="cfu-box" data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115" style="position: absolute; top: 40px; right: 20px; width: 280px; background: #fef3c7; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b; z-index: 100;">
    <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #92400e;">CHECK FOR UNDERSTANDING</p>
    <p style="margin: 0; font-size: 14px; color: #1d1d1d;">[Your CFU question here]</p>
  </div>

  This positions the CFU box in the top right, ON TOP of all content.
  ============================================================
-->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Title Zone: 0-120px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Step Badge -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div data-pptx-region="badge"
           data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"
           style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">{{step_badge}}</p>
      </div>
    </div>
    <!-- Main Question/Action - PROMINENT -->
    <h1 data-pptx-region="title"
        data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"
        style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">{{title}}</h1>
    <!-- Instruction Text -->
    <p data-pptx-region="subtitle"
       data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"
       style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">{{subtitle}}</p>
  </div>

  <!-- Content Zone: 110-490px (380px height) -->
  <div data-pptx-region="content"
       data-pptx-x="20" data-pptx-y="130" data-pptx-w="920" data-pptx-h="370"
       class="fill-height col" style="padding: 10px 20px;">
    {{content}}
  </div>

  <!-- Label Zone (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

  <!-- CFU Box (ABSOLUTE POSITIONED TOP RIGHT, ON TOP OF CONTENT) -->
  <div data-pptx-region="cfu-box"
       data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115"
       style="position: absolute; top: 40px; right: 20px; width: 280px; background: #fef3c7; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b; z-index: 100;">
    <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #92400e;">CHECK FOR UNDERSTANDING</p>
    <p style="margin: 0; font-size: 14px; color: #1d1d1d;">{{cfu_question}}</p>
  </div>

</body>
</html>
`;

/**
 * Slide with Answer box visible
 * Used for step slides where answer is revealed
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-with-answer.html
 */
export const SLIDE_WITH_ANSWER_TEMPLATE = `
<!--
  ============================================================
  REFERENCE EXAMPLE: Slide with Answer Box (TOP RIGHT OVERLAY)
  ============================================================
  ⚠️  DO NOT use this template to generate new slides!

  HOW TO CREATE AN ANSWER SLIDE (slides 6, 10):
  1. COPY the ENTIRE previous slide verbatim (slide 5 or 9)
  2. Find the closing </body> tag
  3. INSERT the Answer box IMMEDIATELY BEFORE </body>
  4. Change NOTHING else - not even a single character

  The Answer box to insert (ABSOLUTE POSITIONED TOP RIGHT):
  <div style="position: absolute; top: 40px; right: 20px; width: 280px; background: #dcfce7; border-radius: 8px; padding: 16px; border-left: 4px solid #22c55e; z-index: 100;">
    <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #166534;">ANSWER</p>
    <p style="margin: 0; font-size: 14px; color: #1d1d1d;">[Your answer explanation here]</p>
  </div>

  This positions the Answer box in the top right, ON TOP of all content.
  ============================================================
-->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Title Zone: 0-120px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Step Badge (if applicable) -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div data-pptx-region="badge"
           data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"
           style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">{{step_badge}}</p>
      </div>
    </div>
    <!-- Main Question/Action - PROMINENT -->
    <h1 data-pptx-region="title"
        data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"
        style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">{{title}}</h1>
    <!-- Instruction Text -->
    <p data-pptx-region="subtitle"
       data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"
       style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">{{subtitle}}</p>
  </div>

  <!-- Content Zone: 110-490px (380px height) -->
  <div data-pptx-region="content"
       data-pptx-x="20" data-pptx-y="130" data-pptx-w="920" data-pptx-h="370"
       class="fill-height col" style="padding: 10px 20px;">
    {{content}}
  </div>

  <!-- Label Zone (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

  <!-- Answer Box (ABSOLUTE POSITIONED TOP RIGHT, ON TOP OF CONTENT) -->
  <div data-pptx-region="answer-box"
       data-pptx-x="653" data-pptx-y="40" data-pptx-w="280" data-pptx-h="115"
       style="position: absolute; top: 40px; right: 20px; width: 280px; background: #dcfce7; border-radius: 8px; padding: 16px; border-left: 4px solid #22c55e; z-index: 100;">
    <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 13px; color: #166534;">ANSWER</p>
    <p style="margin: 0; font-size: 14px; color: #1d1d1d;">{{answer}}</p>
  </div>

</body>
</html>
`;

/**
 * Two-column layout slide
 * 40% text / 60% visual layout for problem setup and steps
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-two-column.html
 */
export const SLIDE_TWO_COLUMN_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Title Zone: 0-120px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Step Badge (if applicable) -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div data-pptx-region="badge"
           data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"
           style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">{{step_badge}}</p>
      </div>
    </div>
    <!-- Main Question/Action - PROMINENT -->
    <h1 data-pptx-region="title"
        data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"
        style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">{{title}}</h1>
    <!-- Instruction Text -->
    <p data-pptx-region="subtitle"
       data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"
       style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">{{subtitle}}</p>
  </div>

  <!--
    ============================================================
    Content Zone: Two-column layout (40% text / 60% visual)
    ============================================================
    LAYOUT RULE: Text/tables on LEFT, graphs/visuals on RIGHT

    Why this matters:
    - Graphs on the right provide consistent visual anchoring
    - Left-to-right reading flow: read problem → see visual
    - Avoids tight vertical spacing when graph is below text
    - PPTX export works better with side-by-side layout
    ============================================================
  -->
  <div class="row gap-lg fill-height" style="padding: 10px 20px;">

    <!-- LEFT Column: Text/Tables (40%) - Always contains problem text, bullets, tables -->
    <div data-pptx-region="left-column"
         data-pptx-x="20" data-pptx-y="130" data-pptx-w="368" data-pptx-h="380"
         class="col" style="width: 40%;">
      <h3 style="font-size: 15px; font-weight: bold; margin: 0 0 12px 0; color: #1d1d1d;">{{section_header}}</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6; color: #1d1d1d;">
        <li>{{bullet_1}}</li>
        <li>{{bullet_2}}</li>
        <li>{{bullet_3}}</li>
      </ul>
    </div>

    <!-- RIGHT Column: Visual (60%) - ALWAYS contains graphs/diagrams/images -->
    <!-- RULE: Graphs go HERE (right column), NEVER below the text -->
    <div data-pptx-region="right-column"
         data-pptx-x="408" data-pptx-y="130" data-pptx-w="532" data-pptx-h="380"
         class="col center" style="width: 60%;">
      <!-- For SVG: use viewBox + fixed dimensions -->
      <!-- <svg viewBox="0 0 420 380" style="width: 520px; height: 360px;"> -->
      <!-- For image: use max dimensions -->
      <img src="{{image_path}}" style="max-width: 520px; max-height: 360px; object-fit: contain;" />
    </div>

  </div>

  <!-- Label Zone (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

</body>
</html>
`;

/**
 * Learning Goal slide template
 * Opening slide with strategy name, steps, and learning goal
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-learning-goal.html
 */
export const SLIDE_LEARNING_GOAL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Learning Goal</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Learning Goal Opening Slide -->
  <div class="col center fill-height" style="padding: 40px;">

    <!-- Strategy Badge -->
    <div data-pptx-region="strategy-badge"
         data-pptx-x="380" data-pptx-y="80" data-pptx-w="200" data-pptx-h="40"
         style="background: #1791e8; color: #ffffff; padding: 8px 24px; border-radius: 20px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">{{strategy_badge}}</p>
    </div>

    <!-- Strategy Name -->
    <h1 data-pptx-region="strategy-name"
        data-pptx-x="80" data-pptx-y="130" data-pptx-w="800" data-pptx-h="50"
        style="margin: 0 0 16px 0; font-size: 40px; color: #1d1d1d; text-align: center;">{{strategy_name}}</h1>

    <!-- Strategy Summary -->
    <p data-pptx-region="strategy-summary"
       data-pptx-x="130" data-pptx-y="190" data-pptx-w="700" data-pptx-h="60"
       style="margin: 0; font-size: 20px; color: #737373; text-align: center; max-width: 700px; line-height: 1.5;">{{strategy_summary}}</p>

    <!-- Learning Goal Box -->
    <div data-pptx-region="learning-goal-box"
         data-pptx-x="80" data-pptx-y="280" data-pptx-w="800" data-pptx-h="120"
         style="background: #f5f5f5; border-radius: 12px; padding: 20px 32px; margin-top: 32px; max-width: 800px;">
      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #737373; text-transform: uppercase; letter-spacing: 1px;">Learning Goal</p>
      <p style="margin: 0; font-size: 16px; color: #1d1d1d; line-height: 1.5;">{{learning_goal}}</p>
    </div>

  </div>

  <!-- Label Zone (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

</body>
</html>
`;

/**
 * Practice slide template
 * Used for practice problems with ZERO scaffolding
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-practice.html
 */
export const SLIDE_PRACTICE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Practice Problem</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Title Zone: 0-120px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Practice Badge -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div data-pptx-region="badge"
           data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"
           style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">PRACTICE</p>
      </div>
    </div>
    <!-- Main Question/Action - PROMINENT -->
    <h1 data-pptx-region="title"
        data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"
        style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">{{title}}</h1>
    <!-- Instruction Text -->
    <p data-pptx-region="subtitle"
       data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"
       style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">{{subtitle}}</p>
  </div>

  <!-- Content Zone: Practice problem with zero scaffolding -->
  <div class="fill-height col" style="padding: 10px 20px;">

    <!-- Problem Statement -->
    <div data-pptx-region="problem-statement"
         data-pptx-x="20" data-pptx-y="130" data-pptx-w="920" data-pptx-h="80"
         style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <p style="margin: 0; font-size: 16px; color: #1d1d1d; line-height: 1.6;">{{problem_statement}}</p>
    </div>

    <!-- Visual/Diagram Area (if applicable) -->
    <div data-pptx-region="problem-visual"
         data-pptx-x="20" data-pptx-y="220" data-pptx-w="920" data-pptx-h="230"
         class="col center fill-height">
      {{problem_visual}}
    </div>

    <!-- Your Task Section -->
    <div data-pptx-region="task-instruction"
         data-pptx-x="20" data-pptx-y="460" data-pptx-w="920" data-pptx-h="50"
         style="background: #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-top: 12px;">
      <p style="margin: 0; font-size: 13px; color: #1d1d1d;">
        <strong>Your Task:</strong> {{task_instruction}}
      </p>
    </div>

  </div>

  <!-- Label Zone (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

</body>
</html>
`;

/**
 * Slide with SVG visual
 * Used for slides with coordinate planes, graphs, or diagrams
 * Includes data-svg-region attributes for PPTX capture
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/slide-with-svg.html
 */
export const SLIDE_WITH_SVG_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style>
    /* PPTX-Compatible CSS Variables */
    :root {
      --color-primary: #1791e8;
      --color-primary-foreground: #ffffff;
      --color-surface: #ffffff;
      --color-surface-foreground: #1d1d1d;
      --color-muted: #f5f5f5;
      --color-muted-foreground: #737373;
      --color-cfu: #fef3c7;
      --color-answer: #dcfce7;
      --color-border: #e5e7eb;
    }

    /* Layout classes required by html2pptx */
    .row { display: flex; flex-direction: row; }
    .col { display: flex; flex-direction: column; }
    .fit { flex: 0 0 auto; }
    .fill-width { flex: 1 1 auto; width: 100%; }
    .fill-height { flex: 1 1 auto; }
    .center { display: flex; align-items: center; justify-content: center; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }

    /* Background classes */
    .bg-surface { background: var(--color-surface); }
    .bg-primary { background: var(--color-primary); }
    .bg-muted { background: var(--color-muted); }

    /* Text classes */
    .text-surface-foreground { color: var(--color-surface-foreground); }
    .text-primary { color: var(--color-primary); }
    .text-muted-foreground { color: var(--color-muted-foreground); }

    /* Spacing classes (4px base unit) */
    .gap-sm { gap: 8px; }
    .gap-md { gap: 12px; }
    .gap-lg { gap: 20px; }

    /* Border radius */
    .rounded { border-radius: 8px; }
    .pill { border-radius: 9999px; }
  </style>
</head>
<body class="col bg-surface" style="width: 960px; height: 540px; position: relative; font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: hidden;">

  <!-- Title Zone: 0-120px -->
  <div style="width: 920px; margin: 0 20px; padding-top: 16px;" class="fit">
    <!-- Step Badge (if applicable) -->
    <div class="row items-center gap-md" style="margin-bottom: 8px;">
      <div data-pptx-region="badge"
           data-pptx-x="20" data-pptx-y="16" data-pptx-w="180" data-pptx-h="35"
           style="background: #1791e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block;">
        <p style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">{{step_badge}}</p>
      </div>
    </div>
    <!-- Main Question/Action - PROMINENT -->
    <h1 data-pptx-region="title"
        data-pptx-x="20" data-pptx-y="55" data-pptx-w="920" data-pptx-h="40"
        style="margin: 0; font-size: 28px; font-weight: bold; color: #1791e8; line-height: 1.2;">{{title}}</h1>
    <!-- Instruction Text -->
    <p data-pptx-region="subtitle"
       data-pptx-x="20" data-pptx-y="100" data-pptx-w="920" data-pptx-h="30"
       style="margin-top: 8px; color: #1d1d1d; font-size: 16px; line-height: 1.4;">{{subtitle}}</p>
  </div>

  <!--
    ============================================================
    Content Zone: Two-column layout with SVG
    ============================================================
    LAYOUT RULE: Text/tables on LEFT (35%), SVG graph on RIGHT (65%)

    Why graphs ALWAYS go on the right:
    - Consistent visual anchoring across all step slides
    - Left-to-right reading flow: read problem → see graph
    - Avoids tight vertical spacing when graph is below text
    - PPTX export works better with side-by-side layout

    NEVER place graphs below the text column - always side-by-side.
    ============================================================
  -->
  <div class="row gap-lg" style="padding: 8px 20px; height: 400px;">

    <!-- LEFT Column: Text/Tables (35%) - Problem text, annotations, CFU/Answer boxes -->
    <div data-pptx-region="left-column"
         data-pptx-x="20" data-pptx-y="130" data-pptx-w="316" data-pptx-h="380"
         class="col" style="width: 35%;">
      <p style="font-size: 14px; line-height: 1.6; color: #1d1d1d; margin: 0;">
        {{problem_text}}
      </p>
      {{additional_content}}
    </div>

    <!--
      ============================================================
      RIGHT Column: SVG VISUAL REGION (65%)
      ============================================================
      RULE: Graphs ALWAYS go here (right column), NEVER below text.

      Fixed coordinates for screenshot capture:
      Position: x=356, y=88, width=584, height=392

      When generating SVGs:
      - Use viewBox that fits within 560x370 (with padding)
      - Set explicit width/height on <svg> element
      - SVG will be centered within this container
      ============================================================
    -->
    <div
      id="svg-container"
      data-pptx-region="svg-container"
      data-pptx-x="356" data-pptx-y="130" data-pptx-w="584" data-pptx-h="380"
      data-svg-region="true"
      class="col center"
      style="width: 65%; background: #f5f5f5; border-radius: 8px; padding: 12px;"
    >
      <!-- SVG goes here with explicit dimensions -->
      <svg
        viewBox="{{svg_viewbox}}"
        style="width: {{svg_width}}px; height: {{svg_height}}px;"
      >
        {{svg_content}}
      </svg>
    </div>

  </div>

  <!-- Label Zone (top right) -->
  <p data-pptx-region="footnote"
     data-pptx-x="700" data-pptx-y="8" data-pptx-w="240" data-pptx-h="25"
     style="position: absolute; top: 8px; right: 20px; font-size: 10pt; color: #666; margin: 0; text-align: right;">
    {{footnote}}
  </p>

</body>
</html>
`;

/**
 * Printable slide template - Use for worksheet slides
 *
 * CRITICAL RULES:
 * 1. ALL practice problems go in ONE slide file with multiple print-page divs
 * 2. Each print-page div = one printed page (8.5in x 11in)
 * 3. Use white background, black text, Times New Roman font for printing
 * 4. Include ONLY: Header, Learning Goal, Problem content - NO strategy reminders
 * 5. NEVER create separate slide files for each problem
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/printable-slide-snippet.html
 */
export const PRINTABLE_TEMPLATE = `
<!-- PRINTABLE WORKSHEET SLIDE TEMPLATE -->
<!-- This slide is designed for teachers to print and distribute to students -->
<!-- Uses white background, black text, and letter-sized pages for printing -->

<!-- ============================================================== -->
<!-- CRITICAL: ALL PRACTICE PROBLEMS GO IN ONE SLIDE FILE           -->
<!-- ============================================================== -->
<!-- Each problem gets its own print-page div within the slide      -->
<!-- DO NOT create separate slide files for each problem            -->
<!-- This single slide-11.html contains ALL printable problems      -->
<!-- Each print-page div = one printed page (8.5in x 11in)          -->
<!-- ============================================================== -->

<!-- ============================================================== -->
<!-- KEEP IT SIMPLE - ONLY INCLUDE WHAT'S LISTED BELOW              -->
<!-- ============================================================== -->
<!-- Goal: Reduce cognitive load. Include ONLY these elements:      -->
<!--   1. Header (lesson title, unit/lesson, name/date fields)      -->
<!--   2. Learning Goal box                                         -->
<!--   3. Problem content (scenario, visuals, task)                 -->
<!--                                                                -->
<!-- DO NOT ADD: Strategy reminders, hints, extra scaffolding, etc. -->
<!-- Students should apply the strategy independently at this point -->
<!-- ============================================================== -->

<div class="slide-container" style="width: 100vw; height: 100vh; background: #ffffff; display: flex; flex-direction: column; overflow-y: auto; color: #000000; font-family: 'Times New Roman', Georgia, serif;">

    <!-- Page 1: Problem 1 -->
    <div class="print-page" style="width: 8.5in; height: 11in; margin: 0 auto; padding: 0.5in; box-sizing: border-box; display: flex; flex-direction: column; flex-shrink: 0; border: 1px solid #ccc;">
        <!-- Header with lesson info -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            <div>
                <h1 style="font-size: 22px; font-weight: 700; margin: 0; color: #000;">[LESSON TITLE]</h1>
                <p style="font-size: 13px; color: #333; margin: 4px 0 0 0;">Unit [X] Lesson [Y] | Grade [Z]</p>
            </div>
            <div style="text-align: right;">
                <p style="font-size: 13px; margin: 0;">Name: _______________________</p>
                <p style="font-size: 13px; margin: 4px 0 0 0;">Date: ________________________</p>
            </div>
        </div>

        <!-- Learning Goal Box -->
        <div style="background: #f5f5f5; border: 1px solid #333; padding: 10px 12px; margin-bottom: 20px;">
            <p style="font-size: 12px; margin: 0; line-height: 1.5;"><strong>Learning Goal:</strong> [STUDENT-FACING LEARNING GOAL]</p>
        </div>

        <!-- Problem 1 -->
        <div style="border: 2px solid #333; padding: 20px; display: flex; flex-direction: column; flex: 1;">
            <div style="background: #f0f0f0; margin: -20px -20px 15px -20px; padding: 10px 20px; border-bottom: 1px solid #333;">
                <h3 style="font-size: 18px; margin: 0; font-weight: bold;">Problem 1: [SCENARIO NAME]</h3>
            </div>
            <p style="font-size: 14px; line-height: 1.5; margin: 0 0 15px 0;">
                [PROBLEM DESCRIPTION - Full context and setup]
            </p>

            <!-- Problem Content: Tables, Equations, Graphs as needed -->
            <div style="display: flex; gap: 30px; margin-bottom: 20px; flex: 1;">
                <!-- Example: Table -->
                <div style="flex: 1;">
                    <p style="font-size: 13px; font-weight: bold; margin: 0 0 8px 0;">[Option A Name]</p>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="background: #e0e0e0;">
                                <th style="border: 1px solid #666; padding: 8px; text-align: center;">[Column 1]</th>
                                <th style="border: 1px solid #666; padding: 8px; text-align: center;">[Column 2]</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style="border: 1px solid #666; padding: 8px; text-align: center;">[value]</td><td style="border: 1px solid #666; padding: 8px; text-align: center;">[value]</td></tr>
                            <tr><td style="border: 1px solid #666; padding: 8px; text-align: center;">[value]</td><td style="border: 1px solid #666; padding: 8px; text-align: center;">[value]</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- Example: Equation -->
                <div style="flex: 1;">
                    <p style="font-size: 13px; font-weight: bold; margin: 0 0 8px 0;">[Option B Name]</p>
                    <div style="border: 1px solid #666; padding: 15px; text-align: center; background: #fafafa;">
                        <p style="font-size: 18px; margin: 0; font-weight: bold;">y = [k]x</p>
                        <p style="font-size: 11px; margin: 8px 0 0 0; color: #666;">where x = [input], y = [output]</p>
                    </div>
                </div>
            </div>

            <div style="border-top: 2px solid #333; padding-top: 15px; margin-top: auto;">
                <p style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">Your Task:</p>
                <p style="font-size: 13px; line-height: 1.5; margin: 0;">
                    [SPECIFIC QUESTION - e.g., "If you [context], which option would give you MORE [outcome]? How much more?"]
                </p>
                <div style="margin-top: 15px; border: 1px solid #ccc; padding: 10px; min-height: 60px;">
                    <p style="font-size: 11px; color: #666; margin: 0;">Show your work:</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Page 2: Problem 2 -->
    <div class="print-page" style="width: 8.5in; height: 11in; margin: 20px auto 0 auto; padding: 0.5in; box-sizing: border-box; display: flex; flex-direction: column; flex-shrink: 0; border: 1px solid #ccc;">
        <!-- Header with lesson info (repeated for each page) -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            <div>
                <h1 style="font-size: 22px; font-weight: 700; margin: 0; color: #000;">[LESSON TITLE]</h1>
                <p style="font-size: 13px; color: #333; margin: 4px 0 0 0;">Unit [X] Lesson [Y] | Grade [Z]</p>
            </div>
            <div style="text-align: right;">
                <p style="font-size: 13px; margin: 0;">Name: _______________________</p>
                <p style="font-size: 13px; margin: 4px 0 0 0;">Date: ________________________</p>
            </div>
        </div>

        <!-- Learning Goal Box (repeated for each page) -->
        <div style="background: #f5f5f5; border: 1px solid #333; padding: 10px 12px; margin-bottom: 20px;">
            <p style="font-size: 12px; margin: 0; line-height: 1.5;"><strong>Learning Goal:</strong> [STUDENT-FACING LEARNING GOAL]</p>
        </div>

        <!-- Problem 2 -->
        <div style="border: 2px solid #333; padding: 20px; display: flex; flex-direction: column; flex: 1;">
            <div style="background: #f0f0f0; margin: -20px -20px 15px -20px; padding: 10px 20px; border-bottom: 1px solid #333;">
                <h3 style="font-size: 18px; margin: 0; font-weight: bold;">Problem 2: [SCENARIO NAME]</h3>
            </div>
            <p style="font-size: 14px; line-height: 1.5; margin: 0 0 15px 0;">
                [PROBLEM DESCRIPTION - Full context and setup]
            </p>

            <!-- Problem Content -->
            <div style="display: flex; gap: 30px; margin-bottom: 20px; flex: 1;">
                <!-- Add tables, equations, graphs as needed -->
            </div>

            <div style="border-top: 2px solid #333; padding-top: 15px; margin-top: auto;">
                <p style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">Your Task:</p>
                <p style="font-size: 13px; line-height: 1.5; margin: 0;">
                    [SPECIFIC QUESTION]
                </p>
                <div style="margin-top: 15px; border: 1px solid #ccc; padding: 10px; min-height: 60px;">
                    <p style="font-size: 11px; color: #666; margin: 0;">Show your work:</p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Print-specific styles -->
<style>
@media print {
    .slide-container {
        overflow: visible !important;
        height: auto !important;
    }
    .print-page {
        width: 8.5in !important;
        height: 11in !important;
        margin: 0 !important;
        padding: 0.5in !important;
        box-sizing: border-box !important;
        page-break-after: always;
        border: none !important;
    }
    .print-page:last-child {
        page-break-after: auto;
    }
    svg line, svg path, svg text, svg circle {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }
    div[style*="background"] {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }
}
@page {
    size: letter portrait;
    margin: 0;
}
</style>
`;

// ============================================================================
// Legacy exports (deprecated - use new PPTX templates above)
// ============================================================================

/**
 * @deprecated Use SLIDE_WITH_CFU_TEMPLATE instead (PPTX-compatible, no toggle)
 */
export const CFU_TOGGLE_TEMPLATE = SLIDE_WITH_CFU_TEMPLATE;

/**
 * @deprecated Use SLIDE_WITH_ANSWER_TEMPLATE instead (PPTX-compatible, no toggle)
 */
export const ANSWER_TOGGLE_TEMPLATE = SLIDE_WITH_ANSWER_TEMPLATE;

// ============================================================================
// SVG SNIPPETS - Copy-paste starting points
// ============================================================================

/**
 * Graph Snippet - Complete coordinate plane template
 * Use as starting point for ALL SVG graphs.
 *
 * Contains:
 * - Arrow marker definitions for axes and lines
 * - Complete grid with proper alignment
 * - Single "0" at origin
 * - Complete scale labels to the arrows
 * - Example data lines with extension arrows
 *
 * HOW TO USE:
 * 1. Copy the <svg>...</svg> block
 * 2. Adjust X_MAX and Y_MAX for your data
 * 3. Recalculate positions using: pixelX = 40 + (dataX/X_MAX)*220, pixelY = 170 - (dataY/Y_MAX)*150
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/graph-snippet.html
 */
export const GRAPH_SNIPPET = `
<!--
  ============================================================
  GRAPH SNIPPET - Complete Coordinate Plane Template
  ============================================================
  Use this as the starting point for ALL SVG coordinate planes.

  HOW TO USE:
  1. Copy the entire <svg>...</svg> block below
  2. Adjust X_MAX and Y_MAX for your data range
  3. Recalculate grid line and label positions using formulas
  4. Add your data lines and points

  FORMULAS:
    pixelX = 40 + (dataX / X_MAX) * 220
    pixelY = 170 - (dataY / Y_MAX) * 150

  QUICK CALC for any scale:
    - Per-unit spacing = 220 / X_MAX (for X) or 150 / Y_MAX (for Y)
    - Example: X_MAX=6 → 220/6 = 36.67px per unit
    - Then: x=1 → 40 + 36.67 = 76.67
            x=2 → 40 + 73.33 = 113.33
            etc.

  CONSTANTS:
    ORIGIN = (40, 170)
    PLOT_WIDTH = 220px
    PLOT_HEIGHT = 150px
    viewBox = "0 0 280 200"

  AXIS REQUIREMENTS (all mandatory):
    - Arrowheads on both axes
    - Single "0" at origin (NOT two separate zeros)
    - Complete scale labels to last tick before arrow
    - Lines extend to plot edges with arrows
  ============================================================
-->

<svg viewBox="0 0 280 200" style="width: 100%; height: 340px;">
    <!--
    ============================================================
    PPTX LAYER STRUCTURE - For multi-layer export
    ============================================================
    data-pptx-layer="base-graph"  → Grid, axes, ticks, axis labels
    data-pptx-layer="data"        → Data lines, points
    data-pptx-layer="annotation"  → Y-intercept labels, arrows, equation labels

    Export can hide layers selectively for transparent PNG capture.
    ============================================================

    This example uses X_MAX=6, Y_MAX=18 (counting by 1s on X, by 2s on Y)

    FORMULAS:
      pixelX = 40 + (dataX / X_MAX) * 220
      pixelY = 170 - (dataY / Y_MAX) * 150

    X tick positions (X_MAX=6, counting by 1s = 7 ticks):
      x=0: 40, x=1: 76.67, x=2: 113.33, x=3: 150, x=4: 186.67, x=5: 223.33, x=6: 260

    Y tick positions (Y_MAX=18, counting by 2s = 10 ticks):
      y=0: 170, y=2: 153.33, y=4: 136.67, y=6: 120, y=8: 103.33,
      y=10: 86.67, y=12: 70, y=14: 53.33, y=16: 36.67, y=18: 20
    -->

    <!-- ===== MARKER DEFINITIONS (required) ===== -->
    <defs>
        <!-- Axis arrows (dark, matches axis color) -->
        <marker id="axis-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#1e293b"/>
        </marker>

        <!-- Line arrows (colored, inherits from stroke) -->
        <marker id="line-arrow-blue" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#60a5fa"/>
        </marker>
        <marker id="line-arrow-green" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#22c55e"/>
        </marker>
        <marker id="line-arrow-red" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#ef4444"/>
        </marker>
    </defs>

    <!-- ===== BASE GRAPH LAYER: Grid, Axes, Labels ===== -->
    <g data-pptx-layer="base-graph">
        <!-- Grid at EVERY tick position (consistent spacing, no gaps) -->
        <g stroke="#e2e8f0" stroke-width="0.5">
            <!-- Vertical grid lines (at every X tick, excluding origin) -->
            <line x1="76.67" y1="20" x2="76.67" y2="170"/>   <!-- x=1 -->
            <line x1="113.33" y1="20" x2="113.33" y2="170"/> <!-- x=2 -->
            <line x1="150" y1="20" x2="150" y2="170"/>       <!-- x=3 -->
            <line x1="186.67" y1="20" x2="186.67" y2="170"/> <!-- x=4 -->
            <line x1="223.33" y1="20" x2="223.33" y2="170"/> <!-- x=5 -->
            <line x1="260" y1="20" x2="260" y2="170"/>       <!-- x=6 -->

            <!-- Horizontal grid lines (at every Y tick, excluding origin) -->
            <line x1="40" y1="153.33" x2="260" y2="153.33"/> <!-- y=2 -->
            <line x1="40" y1="136.67" x2="260" y2="136.67"/> <!-- y=4 -->
            <line x1="40" y1="120" x2="260" y2="120"/>       <!-- y=6 -->
            <line x1="40" y1="103.33" x2="260" y2="103.33"/> <!-- y=8 -->
            <line x1="40" y1="86.67" x2="260" y2="86.67"/>   <!-- y=10 -->
            <line x1="40" y1="70" x2="260" y2="70"/>         <!-- y=12 -->
            <line x1="40" y1="53.33" x2="260" y2="53.33"/>   <!-- y=14 -->
            <line x1="40" y1="36.67" x2="260" y2="36.67"/>   <!-- y=16 -->
            <line x1="40" y1="20" x2="260" y2="20"/>         <!-- y=18 -->
        </g>

        <!-- Axes with arrowheads (extend 15px past last label position) -->
        <line x1="40" y1="170" x2="275" y2="170" stroke="#1e293b" stroke-width="2" marker-end="url(#axis-arrow)"/>
        <line x1="40" y1="180" x2="40" y2="5" stroke="#1e293b" stroke-width="2" marker-end="url(#axis-arrow)"/>

        <!-- X-axis ticks (at every integer from 0-6) -->
        <g stroke="#1e293b" stroke-width="1.5">
            <line x1="40" y1="170" x2="40" y2="175"/>        <!-- x=0 -->
            <line x1="76.67" y1="170" x2="76.67" y2="175"/> <!-- x=1 -->
            <line x1="113.33" y1="170" x2="113.33" y2="175"/> <!-- x=2 -->
            <line x1="150" y1="170" x2="150" y2="175"/>      <!-- x=3 -->
            <line x1="186.67" y1="170" x2="186.67" y2="175"/> <!-- x=4 -->
            <line x1="223.33" y1="170" x2="223.33" y2="175"/> <!-- x=5 -->
            <line x1="260" y1="170" x2="260" y2="175"/>      <!-- x=6 -->
        </g>
        <!-- Y-axis ticks (at every even number from 0-18) -->
        <g stroke="#1e293b" stroke-width="1.5">
            <line x1="35" y1="170" x2="40" y2="170"/>        <!-- y=0 -->
            <line x1="35" y1="153.33" x2="40" y2="153.33"/> <!-- y=2 -->
            <line x1="35" y1="136.67" x2="40" y2="136.67"/> <!-- y=4 -->
            <line x1="35" y1="120" x2="40" y2="120"/>        <!-- y=6 -->
            <line x1="35" y1="103.33" x2="40" y2="103.33"/> <!-- y=8 -->
            <line x1="35" y1="86.67" x2="40" y2="86.67"/>   <!-- y=10 -->
            <line x1="35" y1="70" x2="40" y2="70"/>          <!-- y=12 -->
            <line x1="35" y1="53.33" x2="40" y2="53.33"/>   <!-- y=14 -->
            <line x1="35" y1="36.67" x2="40" y2="36.67"/>   <!-- y=16 -->
            <line x1="35" y1="20" x2="40" y2="20"/>          <!-- y=18 -->
        </g>

        <!-- Axis labels -->
        <!-- SINGLE "0" at origin (serves both axes) -->
        <text x="33" y="182" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">0</text>

        <!-- X-axis labels (counting by 1s: 0,1,2,3,4,5,6) -->
        <text x="76.67" y="185" fill="#64748b" font-family="Arial" font-size="11" text-anchor="middle">1</text>
        <text x="113.33" y="185" fill="#64748b" font-family="Arial" font-size="11" text-anchor="middle">2</text>
        <text x="150" y="185" fill="#64748b" font-family="Arial" font-size="11" text-anchor="middle">3</text>
        <text x="186.67" y="185" fill="#64748b" font-family="Arial" font-size="11" text-anchor="middle">4</text>
        <text x="223.33" y="185" fill="#64748b" font-family="Arial" font-size="11" text-anchor="middle">5</text>
        <text x="260" y="185" fill="#64748b" font-family="Arial" font-size="11" text-anchor="middle">6</text>

        <!-- Y-axis labels (counting by 2s: 0,2,4,6,8,10,12,14,16,18) -->
        <text x="35" y="157" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">2</text>
        <text x="35" y="140" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">4</text>
        <text x="35" y="124" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">6</text>
        <text x="35" y="107" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">8</text>
        <text x="35" y="90" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">10</text>
        <text x="35" y="74" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">12</text>
        <text x="35" y="57" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">14</text>
        <text x="35" y="40" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">16</text>
        <text x="35" y="24" fill="#64748b" font-family="Arial" font-size="11" text-anchor="end">18</text>
    </g>

    <!-- ===== DATA LAYER: Lines and Points ===== -->
    <g data-pptx-layer="data">
        <!-- Line 1: y = 3x (blue) - from origin to (6,18) -->
        <!-- pixelY at x=6: 170 - (18/18)*150 = 20 -->
        <line x1="40" y1="170" x2="260" y2="20" stroke="#60a5fa" stroke-width="3" marker-end="url(#line-arrow-blue)"/>

        <!-- Line 2: y = 2x + 3 (green) - from (0,3) to (6,15) -->
        <!-- Entry: pixelY = 170 - (3/18)*150 = 145 -->
        <!-- Exit: pixelY = 170 - (15/18)*150 = 45 -->
        <line x1="40" y1="145" x2="260" y2="45" stroke="#22c55e" stroke-width="3" marker-end="url(#line-arrow-green)"/>

        <!-- Data points (optional) -->
        <!-- Point at (3, 9) on blue line: pixelX=150, pixelY=95 -->
        <circle cx="150" cy="95" r="5" fill="#60a5fa"/>

        <!-- Point at (3, 9) on green line: pixelX=150, pixelY=95 -->
        <circle cx="150" cy="95" r="5" fill="#22c55e"/>
    </g>

    <!-- ===== ANNOTATION LAYER: Labels, Arrows, Callouts ===== -->
    <!-- Add annotation elements here using annotation-snippet.html patterns -->
    <g data-pptx-layer="annotation">
        <!-- Example: Y-intercept labels, shift arrows, equation labels -->
        <!-- See annotation-snippet.html for patterns -->
    </g>
</svg>


<!--
  ============================================================
  QUICK REFERENCE: Scale Selection (≤10 ticks target)
  ============================================================

  X-AXIS (ORIGIN_X=40, PLOT_WIDTH=220):
  | X_MAX | Increment | Ticks | Formula: pixelX = 40 + (dataX/X_MAX)*220 |
  |-------|-----------|-------|------------------------------------------|
  | 4     | 1         | 5     | 0→40, 1→95, 2→150, 3→205, 4→260         |
  | 5     | 1         | 6     | 0→40, 1→84, 2→128, 3→172, 4→216, 5→260  |
  | 6     | 1         | 7     | 0→40, 1→77, 2→113, 3→150, 4→187, 5→223, 6→260 |
  | 8     | 2         | 5     | 0→40, 2→95, 4→150, 6→205, 8→260         |
  | 10    | 2         | 6     | 0→40, 2→84, 4→128, 6→172, 8→216, 10→260 |

  Y-AXIS (ORIGIN_Y=170, PLOT_HEIGHT=150):
  | Y_MAX | Increment | Ticks | Formula: pixelY = 170 - (dataY/Y_MAX)*150 |
  |-------|-----------|-------|-------------------------------------------|
  | 9     | 1         | 10    | Count by 1s (max for counting by 1s)     |
  | 18    | 2         | 10    | Count by 2s (max for counting by 2s)     |
  | 36    | 4         | 10    | Count by 4s                              |
  | 45    | 5         | 10    | Count by 5s                              |
  | 72    | 8         | 10    | Count by 8s                              |
  | 90    | 10        | 10    | Count by 10s                             |

  RULE: Grid lines at EVERY tick position. Never skip values!

  COLORS:
  | Use          | Color   | Hex     |
  |--------------|---------|---------|
  | Line 1       | Blue    | #60a5fa |
  | Line 2       | Green   | #22c55e |
  | Line 3       | Red     | #ef4444 |
  | Axis/Grid    | Slate   | #1e293b |
  | Labels       | Gray    | #64748b |
  | Light grid   | Slate   | #e2e8f0 |
  ============================================================
-->
`;

/**
 * Annotation Snippet - Y-intercept labels, arrows, line equations
 * Use for adding annotations to coordinate plane graphs.
 *
 * Contains:
 * - Font styling rules (font-weight="normal", font-size="9")
 * - Position calculation formula from data values
 * - Arrow marker definition
 * - Examples for y-intercept labels, shift arrows, line equations
 *
 * CRITICAL: Annotation positions must be calculated from actual data values
 * using the same formula as the graph: pixelY = 170 - (dataY / Y_MAX) * 150
 *
 * Source: .claude/skills/create-worked-example-sg/phases/03-generate-slides/templates/annotation-snippet.html
 */
export const ANNOTATION_SNIPPET = `
<!--
  ============================================================
  ANNOTATION TEMPLATE - Calculate positions from DATA VALUES
  ============================================================
  Annotations must use the SAME pixel formula as the graph.
  This ensures labels appear at the correct y-intercept positions.

  PPTX LAYER: All annotation elements should be wrapped in:
    <g data-pptx-layer="annotation">...</g>
  This allows the export to capture annotations as a separate
  transparent PNG that can be moved independently in PowerPoint.

  STEP 1: Know your graph constants (from svg-graphs.md)
    ORIGIN_Y = 170      (pixel y for data y=0)
    PLOT_HEIGHT = 150   (pixels from y=0 to y=max)
    Y_MAX = [your max]  (e.g., 50, 100, 200)

  STEP 2: Calculate pixel positions from data values
    pixelY = 170 - (dataY / Y_MAX) * 150

  STEP 3: Use calculated pixelY for label and arrow positions

  FONT RULES (apply to ALL annotations):
  - font-family="Arial"
  - font-size="9"
  - font-weight="normal" (NOT bold - too thick)
  ============================================================
-->


<!-- ========== Y-INTERCEPT ANNOTATION EXAMPLE ========== -->
<!--
  Example: Two lines with y-intercepts at 0 and 20, Y_MAX = 50

  Calculate pixel positions:
  - y-intercept 0:  pixelY = 170 - (0/50)*150 = 170
  - y-intercept 20: pixelY = 170 - (20/50)*150 = 110

  Label positions: x=5 (left margin), y=pixelY
  Arrow positions: x=25, from pixelY1 to pixelY2
-->

<!-- Arrow marker definition (add to <defs> section, use ONCE per SVG) -->
<defs>
  <marker id="annotation-arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
    <polygon points="0 0, 6 2, 0 4" fill="#ef4444"/>
  </marker>
</defs>

<!-- ===== WRAP ALL ANNOTATIONS IN THIS GROUP ===== -->
<g data-pptx-layer="annotation">
  <!-- Y-intercept label at y=0 (pixelY=170) -->
  <text x="5" y="170" fill="#60a5fa" font-family="Arial" font-size="9" font-weight="normal">b = 0</text>

  <!-- Y-intercept label at y=20 (pixelY=110) -->
  <text x="5" y="110" fill="#22c55e" font-family="Arial" font-size="9" font-weight="normal">b = 20</text>

  <!-- Arrow showing shift from y=0 to y=20 -->
  <line x1="25" y1="170" x2="25" y2="115" stroke="#ef4444" stroke-width="2" marker-end="url(#annotation-arrow)"/>

  <!-- Arrow label (midpoint: (170+110)/2 = 140) -->
  <text x="5" y="140" fill="#ef4444" font-family="Arial" font-size="9" font-weight="normal">+20</text>
</g>


<!-- ========== POSITION REFERENCE ========== -->
<!--
  X POSITIONS (fixed):
  | Position     | X value | Use for              |
  |--------------|---------|----------------------|
  | Left margin  | 5       | Y-intercept labels   |
  | Arrow line   | 25      | Vertical arrows      |
  | Right margin | 265     | Line equation labels |

  Y POSITIONS (calculated from data):
  | Data Y | Y_MAX=50 | Y_MAX=100 | Y_MAX=200 |
  |--------|----------|-----------|-----------|
  | 0      | 170      | 170       | 170       |
  | 10     | 140      | 155       | 162.5     |
  | 20     | 110      | 140       | 155       |
  | 25     | 95       | 132.5     | 151.25    |
  | 40     | 50       | 110       | 140       |
  | 50     | 20       | 95        | 132.5     |
  | 100    | -        | 20        | 95        |
  | 200    | -        | -         | 20        |

  Formula: pixelY = 170 - (dataY / Y_MAX) * 150
-->


<!-- ========== LINE EQUATION LABELS (right margin) ========== -->
<!--
  Position at x=265, y = line's ending pixelY (or stacked if multiple)
-->
<text x="265" y="30" fill="#60a5fa" font-family="Arial" font-size="9" font-weight="normal">y = 5x</text>
<text x="265" y="45" fill="#22c55e" font-family="Arial" font-size="9" font-weight="normal">y = 5x + 20</text>


<!-- ========== POINT LABELS (inside plot area) ========== -->
<!--
  - Upper half (pixelY < 95): label ABOVE at pixelY - 12
  - Lower half (pixelY >= 95): label BELOW at pixelY + 15
  - Use text-anchor="middle" for centering
-->
<text x="150" y="98" fill="#60a5fa" font-family="Arial" font-size="10" font-weight="normal" text-anchor="middle">(4, 20)</text>
`;
