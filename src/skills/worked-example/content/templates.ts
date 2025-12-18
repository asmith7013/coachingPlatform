/**
 * HTML templates for worked example slides.
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Source of truth: .claude/skills/create-worked-example-sg/templates/
 * To update: Edit the HTML files in the source folder, then run:
 *   npx tsx scripts/sync-skill-content.ts
 *
 * Shared between:
 * - CLI skill: .claude/skills/create-worked-example-sg/
 * - Browser creator: src/app/scm/workedExamples/create/
 */

/**
 * CFU Toggle Template - Use for Ask slides
 * The CFU question appears at the bottom when the button is clicked.
 *
 * Source: .claude/skills/create-worked-example-sg/templates/cfu-toggle-snippet.html
 */
export const CFU_TOGGLE_TEMPLATE = `
<div class="slide-container" style="width: 100vw; height: 100vh; background: linear-gradient(135deg, #121212 0%, #14141e 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px 60px 120px 60px; color: #ffffff; font-family: system-ui, -apple-system, sans-serif; position: relative;">

    <!-- YOUR SLIDE CONTENT HERE -->

</div>

<!-- Toggle button -->
<button id="toggle-hint" onclick="document.getElementById('toggle-hint').style.display='none'; document.getElementById('cfu-box').style.transform='translateY(0)';" style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); color: #94a3b8; font-size: 16px; background: rgba(148, 163, 184, 0.1); border: 2px solid #94a3b8; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s; animation: pulse 2s ease-in-out infinite; z-index: 200; user-select: none;">
    ↓ Show Question
</button>

<!-- CFU Box at bottom -->
<div id="cfu-box" style="position: fixed; bottom: 0; left: 0; right: 0; transform: translateY(100%); transition: transform 0.3s ease-out; z-index: 100;">
    <div style="background: #f59e0b; border-top: 4px solid #fbbf24; padding: 1.25rem 2rem; box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5); position: relative;">
        <button onclick="document.getElementById('cfu-box').style.transform='translateY(100%)'; document.getElementById('toggle-hint').style.display='block';" style="position: absolute; top: 0.75rem; right: 1rem; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border: none; border-radius: 4px; cursor: pointer; color: #000; font-size: 20px; font-weight: bold; line-height: 1; transition: background 0.2s;">
            ×
        </button>
        <div style="display: inline-block; background: rgba(0,0,0,0.3); padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 700; margin-right: 12px;">❓ CHECK FOR UNDERSTANDING</div>
        <span style="color: #000000; font-size: 1.1rem; font-weight: 600;">
            [YOUR QUESTION HERE]
        </span>
    </div>
</div>

<style>
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

#toggle-hint:hover {
    background: rgba(148, 163, 184, 0.2);
    transform: translateX(-50%) scale(1.05);
}
</style>
`;

/**
 * Answer Toggle Template - Use for Reveal slides
 * The answer appears at the bottom when the button is clicked.
 *
 * Source: .claude/skills/create-worked-example-sg/templates/answer-toggle-snippet.html
 */
export const ANSWER_TOGGLE_TEMPLATE = `
<div class="slide-container" style="width: 100vw; height: 100vh; background: linear-gradient(135deg, #121212 0%, #14141e 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px 60px 120px 60px; color: #ffffff; font-family: system-ui, -apple-system, sans-serif; position: relative;">

    <!-- YOUR SLIDE CONTENT HERE -->

</div>

<!-- Toggle button -->
<button id="toggle-hint" onclick="document.getElementById('toggle-hint').style.display='none'; document.getElementById('answer-box').style.transform='translateY(0)';" style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); color: #94a3b8; font-size: 16px; background: rgba(148, 163, 184, 0.1); border: 2px solid #94a3b8; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s; animation: pulse 2s ease-in-out infinite; z-index: 200; user-select: none;">
    ↓ Show Answer
</button>

<!-- Answer Box at bottom -->
<div id="answer-box" style="position: fixed; bottom: 0; left: 0; right: 0; transform: translateY(100%); transition: transform 0.3s ease-out; z-index: 100;">
    <div style="background: #4ade80; border-top: 4px solid #22c55e; padding: 1.25rem 2rem; box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5); position: relative;">
        <button onclick="document.getElementById('answer-box').style.transform='translateY(100%)'; document.getElementById('toggle-hint').style.display='block';" style="position: absolute; top: 0.75rem; right: 1rem; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border: none; border-radius: 4px; cursor: pointer; color: #000; font-size: 20px; font-weight: bold; line-height: 1; transition: background 0.2s;">
            ×
        </button>
        <div style="display: inline-block; background: rgba(0,0,0,0.3); padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 700; margin-right: 12px;">✅ ANSWER</div>
        <span style="color: #000000; font-size: 1.1rem; font-weight: 600;">
            [YOUR ANSWER HERE]
        </span>
    </div>
</div>

<style>
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

#toggle-hint:hover {
    background: rgba(148, 163, 184, 0.2);
    transform: translateX(-50%) scale(1.05);
}
</style>
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
 * Source: .claude/skills/create-worked-example-sg/templates/printable-slide-snippet.html
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
