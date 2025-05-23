```markdown
<doc id="amplify-desmos-project">

# Amplify Desmos Math Coaching Course Development

<section id="project-overview">

## Project Overview

**Project Title:** Amplify Desmos Math Foundational Professional Learning Course

**Client:** Teaching Lab

**Timeline:** Complete by end of June 2025

**Primary Deliverable:** A structured, evidence-based professional learning (PL) 101 (introductory) course specifically for instructional coaches supporting teachers implementing Amplify Desmos Math curriculum.

**Secondary Deliverables:** If time permits, create 201 (advanced) course materials or additional support resources.

[RULE] Focus on developing the 101 foundational course completely before starting any secondary deliverables.

</section>

<section id="project-context">

## Project Context

Teaching Lab is developing a series of professional learning courses to build the capacity of instructional coaches supporting high-quality instructional materials (HQIM). This project focuses on creating a foundational (101) course for coaches supporting Amplify Desmos Math implementation.

The target audience consists of instructional coaches at Teaching Lab who are familiar with Illustrative Mathematics (IM) but have limited or varied experience with Amplify Desmos Math, which is a derivative of IM math. The course will provide coaches with the knowledge and strategies to effectively support teachers in implementing the curriculum with fidelity while addressing common challenges.

```typescript
// Target Audience Characteristics
const targetAudience = {
  role: 'Instructional Coaches at Teaching Lab',
  knowledgeBase: {
    illustrativeMath: 'strong',
    amplifyDesmosMath: 'limited or varied',
    teachingExperience: 'strong',
    digitalTools: 'varied'
  },
  needs: [
    'understanding Amplify Desmos Math structure',
    'coaching strategies for digital math implementation',
    'techniques for supporting teacher transitions',
    'protocols for unit and lesson internalization'
  ]
}
```

[RULE] Design all materials assuming zero direct teaching experience with Amplify Desmos Math.

</section>

<section id="core-requirements">

## Core Project Requirements

```typescript
// Priority Focus Areas
const priorityFocus = [
  {
    area: 'Standards Alignment',
    content: 'CCSS alignment and math instructional shifts',
    deliverables: ['crosswalk document', 'alignment activities']
  },
  {
    area: 'Design Principles',
    content: 'Amplify Desmos Math philosophy and architecture',
    deliverables: ['design principles overview', 'curriculum structure guide']
  },
  {
    area: 'Internalization',
    content: 'Unit and lesson internalization using Teaching Lab tools',
    deliverables: ['internalization protocols', 'practice activities']
  },
  {
    area: 'Implementation',
    content: 'Grounding instructional decisions in curriculum structure',
    deliverables: ['decision frameworks', 'coaching conversation guides']
  }
]

// Format Requirements
const formatRequirements = {
  inPerson: ['facilitation prompts', 'group activities', 'practice protocols'],
  asynchronous: ['self-guided activities', 'reflection prompts', 'application tasks'],
  template: 'Teaching Lab PL Session Overview'
}
```

1. **Primary Focus:** Develop a foundational professional learning session that helps coaches understand how to effectively support teachers implementing Amplify Desmos Math K-12.

2. **Format Requirements:** 
   - Design for both in-person and asynchronous learning formats
   - Include facilitation prompts for in-person delivery
   - Create activity prompts for asynchronous completion
   - Follow Teaching Lab's PL session template

3. **Secondary Focus:** Review and address coaching scenarios with Amplify Desmos Math-specific nuances.

[RULE] Maintain dual format compatibility (in-person and asynchronous) for all materials.

</section>

<section id="curriculum-nuances">

## Curriculum-Specific Nuances

```typescript
// Key Curriculum Characteristics
const amplifyDesmosCharacteristics = {
  standardsAlignment: {
    focus: 'Prioritizes major work over supporting/additional standards',
    challenge: 'State standards may require crosswalking with CCSS',
    coachingImplication: 'Help teachers identify critical vs. supplementary content'
  },
  coherence: {
    structure: 'Lessons build within intentional progression',
    lessonDesign: 'Single lessons present slices of concepts',
    coachingImplication: 'Modifications require understanding full context'
  },
  components: {
    coolDowns: 'Vary in focus (math-based vs. explanation-based)',
    activities: 'Sequential and interdependent',
    coachingImplication: 'Support prioritization decisions'
  },
  instruction: {
    studentDiscourse: 'MLRs purposefully embedded',
    synthesis: 'Requires student construction of understanding',
    coachingImplication: 'MLRs serve as scaffolding foundation'
  }
}
```

Throughout course development, emphasize these critical Amplify Desmos Math-specific characteristics:

1. **Standards Alignment and Focus:**
   - Amplify Desmos Math (derived from IM) prioritizes major work standards over supporting/additional work
   - State-specific standards may require crosswalking with CCSS

2. **Coherence as Core Design Principle:**
   - Lessons don't stand alone—they build within a coherent progression
   - Single lessons present slices of concepts rather than complete mastery
   - Modifications require understanding full context to maintain coherence

3. **Curriculum Component Architecture:**
   - Cool-downs serve as exit tickets that assess daily learning goals
   - Not all cool-downs are math-based; some assess explanations and critical thinking
   - Cool-downs have varying significance in the learning progression

4. **Lesson Structure Considerations:**
   - Activity sequencing is deliberate—each builds on previous activities
   - Skipping activities requires compensating for missed learning
   - Some lessons can move to synthesis without activity completion

5. **Student Discourse Integration:**
   - Mathematical Language Routines (MLRs) are purposefully embedded
   - Lesson synthesis requires student construction of understanding
   - MLRs should be the starting point for scaffolding

[RULE] Explicitly address the derivative relationship between Illustrative Mathematics and Amplify Desmos Math, highlighting key differences.

</section>

<section id="coaching-frameworks">

## Coaching Framework Integration

```typescript
// Coaching Framework Components
const coachingFrameworks = {
  IPG: {
    coreAction1: 'Lessons reflect Focus, Coherence, and Rigor',
    coreAction2: 'Instructional practices support all students',
    coreAction3: 'Students engage in mathematical practices',
    integration: 'Framework for classroom observation and feedback'
  },
  IMFlow: {
    structure: [
      'Learning Targets',
      'Cool Down (5 min)',
      'Warm-Up (5 min)',
      'Activity #1 (10-20 min)',
      'Activity #2 (10-20 min)',
      'Lesson Synthesis (5 min)'
    ],
    emphasis: 'Backwards planning as foundation',
    integration: 'Structure for lesson internalization and planning'
  },
  CoachingConversation: {
    components: [
      'Meeting preparation',
      'Launching cycles with positive framing',
      'Structured check-ins',
      'Progress reflection',
      'Practice components',
      'Next steps and understanding checks'
    ],
    integration: 'Framework for effective coaching interactions'
  },
  CoachingCycles: {
    duration: '4-week cycles',
    goals: 'SMART framework for instructional shifts',
    focus: 'Laser-focused, high-leverage improvements',
    integration: 'Structure for ongoing teacher development'
  }
}
```

The course should incorporate key coaching frameworks from your instructional coaching practice:

1. **Instructional Practice Guide (IPG):**
   - Core Action 1: Ensuring lessons reflect Focus, Coherence, and Rigor
   - Core Action 2: Employing instructional practices that support all students
   - Core Action 3: Providing students with opportunities to engage in mathematical practices

2. **IM Flow Coaching Framework:**
   - Emphasize backwards planning as foundational approach
   - Follow the structured sequence:
     1. Learning Targets
     2. Cool Down (5 min)
     3. Warm-Up (5 min)
     4. Activity #1 (10-20 min)
     5. Activity #2 (10-20 min)
     6. Lesson Synthesis (5 min)

3. **Coaching Conversation Structure:**
   - Incorporate elements from your coaching template:
     - Meeting preparation
     - Launching cycles with positive framing
     - Structured check-ins, reflection on progress, and practice components
     - Clear next steps and understanding checks

4. **Coaching Cycles Framework:**
   - 4-week coaching cycles
   - SMART goals for instructional shifts
   - Focused, high-leverage instructional improvements

[RULE] Ensure all coaching frameworks are adapted specifically for Amplify Desmos Math implementation contexts.

</section>

<section id="secondary-tasks">

## Secondary Tasks (Post-Main Project Completion)

```typescript
// Performance Task Framework
const performanceTasks = [
  {
    id: 1,
    title: 'Aligning Amplify Desmos Math to State Exams',
    focus: 'Standards alignment and assessment preparation',
    challenge: 'Teacher using alternative materials due to exam concerns',
    deliverables: ['alignment protocol', 'coaching conversation framework']
  },
  {
    id: 2,
    title: 'Unit Planning with Limited Days',
    focus: 'Lesson prioritization while maintaining coherence',
    challenge: 'Insufficient instructional time for complete unit',
    deliverables: ['prioritization framework', 'pacing template']
  },
  {
    id: 3,
    title: 'Prioritizing Cool-Downs and Feedback',
    focus: 'Assessment selection and data-informed instruction',
    challenge: 'Teacher overwhelmed by grading demands',
    deliverables: ['cool-down analysis protocol', 'feedback strategy guide']
  },
  {
    id: 4,
    title: 'Condensing 60-Minute Lessons to 45 Minutes',
    focus: 'Lesson adaptation while maintaining rigor',
    challenge: 'Insufficient class time for complete lessons',
    deliverables: ['lesson compression framework', 'activity selection guide']
  },
  {
    id: 5,
    title: 'Supporting Student Discussions',
    focus: 'Mathematical discourse and language routines',
    challenge: 'Teacher-dominated classroom talk',
    deliverables: ['MLR implementation guide', 'discussion strategy toolkit']
  },
  {
    id: 6,
    title: 'Planning Effective Lesson Syntheses',
    focus: 'Student construction of mathematical understanding',
    challenge: 'Passive distribution of lesson summary',
    deliverables: ['synthesis planning template', 'key question bank']
  }
]
```

After completing the primary professional learning course, address the six performance tasks (from documents 3-8) as separate secondary deliverables. These tasks represent real-world coaching scenarios that will help coaches navigate common implementation challenges.

These secondary tasks should only be undertaken after the successful completion of the main project. For each task area, you will develop:
- Instructional strategies specific to Amplify Desmos Math
- Coaching conversation frameworks
- Practice opportunities for coaches
- Resources and templates

While these scenarios may inform the development of your main course by highlighting common challenges, their full development as standalone coaching resources will be a separate phase of work.

[RULE] Secondary tasks should be prioritized in order if time permits after main course completion.

</section>

<section id="development-process">

## Development Process

```typescript
// Development Phases
const developmentPhases = {
  phase1: {
    title: 'Research & Planning',
    activities: [
      'Review all Amplify Desmos Math materials thoroughly',
      'Analyze coaching frameworks for alignment opportunities',
      'Create detailed course outline using Teaching Lab template',
      'Identify needed third-party resources'
    ],
    deliverable: 'Project plan and course outline',
    timeline: '25% of project time'
  },
  phase2: {
    title: 'Content Development',
    activities: [
      'Develop facilitation guides for in-person delivery',
      'Create participant materials and handouts',
      'Design asynchronous learning activities',
      'Develop coaching scenario practice components'
    ],
    deliverable: 'Draft course materials',
    timeline: '50% of project time'
  },
  phase3: {
    title: 'Refinement & Finalization',
    activities: [
      'Review for alignment with Teaching Lab requirements',
      'Ensure appropriate scaffolding between sections',
      'Check for accessibility and clarity',
      'Finalize all materials'
    ],
    deliverable: 'Complete course package',
    timeline: '25% of project time'
  }
}
```

### Phase 1: Research & Planning
1. Review all Amplify Desmos Math materials thoroughly
2. Analyze your coaching frameworks for alignment opportunities
3. Create a detailed course outline using the Teaching Lab template
4. Identify any third-party resources needed

### Phase 2: Content Development
1. Develop facilitation guides for in-person delivery
2. Create participant materials and handouts
3. Design asynchronous learning activities
4. Develop coaching scenario practice components
5. Create assessment tools to evaluate learning

### Phase 3: Refinement & Finalization
1. Review for alignment with Teaching Lab requirements
2. Ensure appropriate scaffolding between sections
3. Check for accessibility and clarity
4. Finalize all materials according to template specifications

[RULE] Complete each phase sequentially; avoid moving to Phase 2 before Phase 1 is fully complete.

</section>

<section id="special-considerations">

## Special Considerations

```typescript
// Key Success Factors
const specialConsiderations = {
  audienceKnowledge: {
    assumption: 'Strong IM knowledge, minimal Amplify Desmos Math experience',
    implication: 'Build on IM understanding while highlighting Amplify-specific elements'
  },
  practicalApplication: {
    priority: 'Simulation and practice opportunities',
    implication: 'Create ready-to-use coaching resources and conversation frames'
  },
  curriculumAccess: {
    limitation: 'Participants may lack full curriculum access',
    implication: 'Create self-contained materials with necessary context'
  },
  developmentApproach: {
    emphasis: 'Coach capacity over curriculum knowledge',
    implication: 'Focus on practical application and strategic implementation'
  }
}
```

1. **Audience Knowledge Base:**
   - Assume coaches know IM well but have minimal experience with Amplify Desmos Math
   - Address the digital component transition explicitly

2. **Practical Application:**
   - Include multiple opportunities for practice through simulation
   - Provide ready-to-use coaching conversation frames
   - Create artifacts coaches can adapt for their own use

3. **Curriculum Access:**
   - You have full access to Amplify Desmos Math, but course participants may not
   - Create self-contained materials that provide necessary context

4. **Development Principles:**
   - Focus on building coach capacity rather than just curriculum knowledge
   - Emphasize practical application over theoretical understanding
   - Create clear connections between coaching frameworks and curriculum features

[RULE] Prioritize practical application and coach capacity-building over comprehensive curriculum coverage.

</section>

<section id="success-criteria">

## Success Criteria

```typescript
// Evaluation Metrics
const successCriteria = [
  {
    area: 'Content Coverage',
    criteria: 'Addresses all primary focus areas specified by Teaching Lab',
    measurement: 'Comprehensive coverage of all required topics'
  },
  {
    area: 'Practical Application',
    criteria: 'Provides practical coaching strategies for implementation challenges',
    measurement: 'Inclusion of coaching scenarios with actionable approaches'
  },
  {
    area: 'Framework Integration',
    criteria: 'Connects coaching frameworks with curriculum features',
    measurement: 'Clear linkage between coaching methods and curriculum elements'
  },
  {
    area: 'Usability',
    criteria: 'Supplies ready-to-use tools and conversation frames',
    measurement: 'Adaptable resources for immediate coach application'
  },
  {
    area: 'Format Adherence',
    criteria: 'Follows Teaching Lab format requirements',
    measurement: 'Complies with template structure for all deliverables'
  },
  {
    area: 'Timeline',
    criteria: 'Completed within specified timeframe',
    measurement: 'Delivery by end of June 2025'
  }
]
```

The completed project will be considered successful if it:

1. Thoroughly addresses the primary focus areas specified by Teaching Lab
2. Provides practical coaching strategies for implementation challenges
3. Presents clear connections between coaching frameworks and Amplify Desmos Math features
4. Provides coaches with ready-to-use tools and conversation frames
5. Follows Teaching Lab's format requirements for both in-person and asynchronous learning
6. Can be completed within the specified timeline (by end of June 2025)

[RULE] Evaluate each deliverable against these success criteria before considering it complete.

</section>

<section id="next-steps">

## Next Steps

```typescript
// Initial Action Items
const nextSteps = [
  {
    action: 'Review Teaching Lab template',
    priority: 'High',
    timeline: 'Immediate',
    outcomes: ['Template understanding', 'Format requirements']
  },
  {
    action: 'Create high-level course outline',
    priority: 'High',
    timeline: 'Week 1',
    outcomes: ['4-section structure', 'Content mapping']
  },
  {
    action: 'Develop Section 1 content',
    priority: 'High',
    timeline: 'Weeks 2-3',
    outcomes: ['Foundations & Alignment materials', 'Initial feedback']
  },
  {
    action: 'Iterate based on feedback',
    priority: 'Medium',
    timeline: 'Ongoing',
    outcomes: ['Refined materials', 'Improved quality']
  }
]
```

1. Begin by reviewing the Teaching Lab template in detail
2. Create a high-level course outline with 4 sections following the template structure
3. Develop content for Section 1 (Foundations & Alignment)
4. Seek feedback before proceeding to subsequent sections
5. Iterate based on feedback while maintaining momentum toward completion

[RULE] Complete steps sequentially, seeking feedback at each milestone before proceeding.

</section>

</doc>
```