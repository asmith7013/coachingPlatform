/**
 * Illustrative Mathematics Curriculum - Course Configuration
 * 
 * This file contains the configuration for all available courses and units.
 */

// Course configuration
const COURSES = {
  'algebra1': {
    name: 'Algebra 1',
    baseUrl: 'https://doe1nyc.ilclassroom.com/wikis/316468-illustrative-mathematics-algebra-1-course',
    units: [
      { id: '316459', name: 'Alg1.1: One-variable Statistics' },
      { id: '316461', name: 'Alg1.2: Linear Equations, Inequalities and Systems' },
      { id: '316462', name: 'Alg1.3: Two-Variable Statistics' },
      { id: '316463', name: 'Alg1.4: Functions' },
      { id: '316464', name: 'Alg1.5: Introduction to Exponential Functions' },
      { id: '316465', name: 'Alg1.6: Introduction to Quadratic Functions' },
      { id: '316467', name: 'Alg1.7: Quadratic Equations' }
    ]
  },
  
  'algebra2': {
    name: 'Algebra 2',
    baseUrl: 'https://doe1nyc.ilclassroom.com/wikis/326686-algebra-2',
    units: [
      { id: '326892', name: 'Alg2.1: Sequences and Functions' },
      { id: '326893', name: 'Alg2.2: Polynomials' },
      { id: '326894', name: 'Alg2.3: Complex Numbers and Rational Exponents' },
      { id: '326895', name: 'Alg2.4: Exponential Equations and Functions' },
      { id: '326896', name: 'Alg2.5: Transformations of Functions' },
      { id: '326897', name: 'Alg2.6: Trigonometric Functions' },
      { id: '326900', name: 'Alg2.7: Statistical Inferences' },
      { id: '326864', name: 'Geo.8 Conditional Probability' },
      { id: '326901', name: 'Mathematical Modeling Prompts' }
    ],
    // resources: [
    //   { id: '326904', name: 'Algebra 2 Course Glossary' },
    //   { id: '2506390', name: 'Algebra 2 Materials List' },
    //   { id: '478838', name: 'Algebra 2 overview and standards breakdown' }
    // ]
  },

  'geometry': {
    name: 'Geometry',
    baseUrl: 'https://doe1nyc.ilclassroom.com/wikis/326685-geometry',
    units: [
      { id: '326854', name: 'Geo.1: Constructions and Rigid Transformations' },
      { id: '326856', name: 'Geo.2: Congruence' },
      { id: '326858', name: 'Geo.3: Similarity' },
      { id: '326859', name: 'Geo.4: Right Triangle Trigonometry' },
      { id: '326860', name: 'Geo.5: Solid Geometry' },
      { id: '326862', name: 'Geo.6: Coordinate Geometry' },
      { id: '326863', name: 'Geo.7: Circles' },
      { id: '326867', name: 'Mathematical Modeling Prompts' }
    ],
    // resources: [
    //   { id: '326889', name: 'Geometry Course Glossary' },
    //   { id: '2506389', name: 'Geometry Materials List' },
    //   { id: '398877', name: 'About the Geometry Reference Chart' },
    //   { id: '478837', name: 'Geometry overview and standards breakdown' },
    //   { id: '18286617', name: 'Geometry Errata' }
    // ]
  },

  'grade8': {
    name: 'Grade 8',
    baseUrl: 'https://doe1nyc.ilclassroom.com/wikis/10801510-grade-8',
    isMiddleSchool: true,
    units: [
      { id: '10801511', name: 'Grade 8 Unit 1 | Rigid Transformations and Congruence' },
      { id: '10802040', name: 'Grade 8 Unit 2 | Dilations, Similarity, and Introducing Slope' },
      { id: '10802497', name: 'Grade 8 Unit 3 | Linear Relationships' },
      { id: '10803070', name: 'Grade 8 Unit 4 | Linear Equations and Linear Systems' },
      { id: '10803321', name: 'Grade 8 Unit 5 | Functions and Volume' },
      { id: '10803655', name: 'Grade 8 Unit 6 | Associations in Data' },
      { id: '10803919', name: 'Grade 8 Unit 7 | Exponents and Scientific Notation' },
      { id: '10804166', name: 'Grade 8 Unit 8 | Pythagorean Theorem and Irrational Numbers' },
      { id: '10804450', name: 'Grade 8 Unit 9 | Putting it All Together' }
    ],
    // resources: [
    //   { id: '25665651', name: 'Grade 8 Teacher Course Guide (Flipbook)' },
    //   { id: '10804775', name: 'Grade 8 Materials List' },
    //   { id: '10765650', name: 'Grade 8 Mathematics Glossary' },
    //   { id: '10804777', name: 'Grade 8 overview and standards breakdown' },
    //   { id: '24417288', name: 'Grade 8 Errata' }
    // ]
  },

  'grade7': {
    name: 'Grade 7',
    baseUrl: 'https://doe1nyc.ilclassroom.com/wikis/10797807-grade-7',
    isMiddleSchool: true,
    units: [
      { id: '10797808', name: 'Grade 7 Unit 1 | Scale Drawings' },
      { id: '10798236', name: 'Grade 7 Unit 2 | Introducing Proportional Relationships' },
      { id: '10798662', name: 'Grade 7 Unit 3 | Measuring Circles' },
      { id: '10799075', name: 'Grade 7 Unit 4 | Proportional Relationships and Percentages' },
      { id: '10799377', name: 'Grade 7 Unit 5 | Rational Number Arithmetic' },
      { id: '10799680', name: 'Grade 7 Unit 6 | Expressions, Equations, and Inequalities' },
      { id: '10799968', name: 'Grade 7 Unit 7 | Angles, Triangles, and Prisms' },
      { id: '10800395', name: 'Grade 7 Unit 8 | Probability and Sampling' },
      { id: '10800760', name: 'Grade 7 Unit 9 | Putting it All Together' }
    ],
    // resources: [
    //   { id: '25665402', name: 'Grade 7 Teacher Course Guide (Flipbook)' },
    //   { id: '10801440', name: 'Grade 7 Materials List' },
    //   { id: '10738297', name: 'Grade 7 Mathematics Glossary' },
    //   { id: '10801443', name: 'Grade 7 Overview and Standards Breakdown' },
    //   { id: '20728766', name: 'Grade 7 Errata' }
    // ]
  },

  'grade6': {
    name: 'Grade 6',
    baseUrl: 'https://doe1nyc.ilclassroom.com/wikis/10793887-grade-6',
    isMiddleSchool: true,
    units: [
      { id: '10793888', name: 'Grade 6 Unit 1 | Area and Surface Area' },
      { id: '10794480', name: 'Grade 6 Unit 2 | Introducing Ratios' },
      { id: '10795049', name: 'Grade 6 Unit 3 | Unit Rates and Percentages' },
      { id: '10795486', name: 'Grade 6 Unit 4 | Dividing Fractions' },
      { id: '10795839', name: 'Grade 6 Unit 5 | Arithmetic in Base Ten' },
      { id: '10796140', name: 'Grade 6 Unit 6 | Expressions and Equations' },
      { id: '10796451', name: 'Grade 6 Unit 7 | Rational Numbers' },
      { id: '10796783', name: 'Grade 6 Unit 8 | Data Sets and Distributions' },
      { id: '10797162', name: 'Grade 6 Unit 9 | Putting it All Together' }
    ],
    // resources: [
    //   { id: '25665387', name: 'Grade 6 Teacher Course Guide (Flipbook)' },
    //   { id: '10797734', name: 'Grade 6 Materials List' },
    //   { id: '10690791', name: 'Grade 6 Mathematics Glossary' },
    //   { id: '10797737', name: 'Grade 6 overview and standards breakdown' },
    //   { id: '20692555', name: 'Grade 6 Errata' }
    // ]
  }
};

// Helper functions
function getAllUnitUrls() {
  const urls = [];
  
  Object.entries(COURSES).forEach(([courseId, course]) => {
    // Add main units
    course.units.forEach(unit => {
      urls.push({
        courseId,
        courseName: course.name,
        unitId: unit.id,
        unitName: unit.name,
        url: `https://doe1nyc.ilclassroom.com/wikis/${unit.id}`
      });
    });
    
    // Add resources if available
    if (course.resources) {
      course.resources.forEach(resource => {
        urls.push({
          courseId,
          courseName: course.name,
          resourceId: resource.id,
          resourceName: resource.name,
          url: `https://doe1nyc.ilclassroom.com/wikis/${resource.id}`
        });
      });
    }
  });
  
  return urls;
}

function getCourseUnits(courseId) {
  if (!COURSES[courseId]) {
    throw new Error(`Course ${courseId} not found in configuration`);
  }
  
  const units = COURSES[courseId].units.map(unit => ({
    unitId: unit.id,
    unitName: unit.name,
    url: `https://doe1nyc.ilclassroom.com/wikis/${unit.id}`
  }));
  
  // Add resources if available
  if (COURSES[courseId].resources) {
    const resources = COURSES[courseId].resources.map(resource => ({
      resourceId: resource.id,
      resourceName: resource.name,
      url: `https://doe1nyc.ilclassroom.com/wikis/${resource.id}`
    }));
    
    return { units, resources };
  }
  
  return { units };
}

// Get pacing guides for all courses
function getPacingGuides() {
  return {
    'algebra2': 'https://docs.google.com/spreadsheets/d/1fQdeCC3FlKzRdyKLzw6WevpVOzqLCodq1JIXN_BPmGg/edit?gid=1360232518#gid=1360232518',
    'geometry': 'https://docs.google.com/spreadsheets/d/19OFb8G_AeFGn7fGfEJPatN__ysORfC6FDeMqsGYBEqY/edit?gid=1360232518#gid=1360232518',
    'grade8': 'https://docs.google.com/spreadsheets/d/1IeMckc596exlOZVfdlZgfhZ5Ioptv-3NjsW_Z7iZ8bY/edit?usp=drive_link',
    'grade7': 'https://docs.google.com/spreadsheets/d/13nrO-pI-FU4mSm1sLvk6qfjjsDpWqO18rCXc71-8HZM/edit?usp=drive_link',
    'grade6': 'https://docs.google.com/spreadsheets/d/1DsOX4NYzVe390WEgMnMR9-i7klB1mns_PCQYs14A9qI/edit?usp=drive_link'
  };
}

// Use CommonJS exports instead of ES module exports
module.exports = {
  COURSES,
  getAllUnitUrls,
  getCourseUnits,
  getPacingGuides
};

// If this script is run directly, print out all available unit URLs
if (require.main === module) {
  const allUnits = getAllUnitUrls();
  console.log(`Found ${allUnits.length} total units and resources across ${Object.keys(COURSES).length} courses:`);
  
  Object.entries(COURSES).forEach(([courseId, course]) => {
    console.log(`\n== ${course.name} ${course.isMiddleSchool ? '(Middle School)' : '(High School)'} ==`);
    
    console.log("\nUnits:");
    course.units.forEach(unit => {
      console.log(`- [${courseId}] ${unit.name} (${unit.id}): https://doe1nyc.ilclassroom.com/wikis/${unit.id}`);
    });
    
    if (course.resources) {
      console.log("\nResources:");
      course.resources.forEach(resource => {
        console.log(`- [${courseId}] ${resource.name} (${resource.id}): https://doe1nyc.ilclassroom.com/wikis/${resource.id}`);
      });
    }
  });
  
  console.log("\nPacing Guides:");
  const pacingGuides = getPacingGuides();
  Object.entries(pacingGuides).forEach(([courseId, url]) => {
    console.log(`- [${courseId}] ${COURSES[courseId].name} Pacing Guide: ${url}`);
  });
} 