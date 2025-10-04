// Test utilities for PDF Save tool
// Note: These are manual tests - run in browser console

import { sanitizeTitle, parseTitles, validateForm } from './utils';

// Test sanitizeTitle function
export function testSanitizeTitle() {
  console.log('Testing sanitizeTitle...');
  
  const testCases = [
    { input: 'Introduction to Fractions', expected: 'introduction-to-fractions' },
    { input: 'Adding & Subtracting', expected: 'adding-subtracting' },
    { input: '  Spaces  Around  ', expected: 'spaces-around' },
    { input: 'Multiple---Dashes', expected: 'multiple-dashes' },
    { input: 'Special!@#$%Characters', expected: 'specialcharacters' },
    { input: '', expected: '' }
  ];
  
  testCases.forEach(({ input, expected }) => {
    const result = sanitizeTitle(input);
    const passed = result === expected;
    console.log(`${passed ? '✅' : '❌'} "${input}" → "${result}" (expected: "${expected}")`);
  });
}

// Test parseTitles function
export function testParseTitles() {
  console.log('Testing parseTitles...');
  
  const testCases = [
    { 
      input: 'Title 1, Title 2, Title 3', 
      expected: ['Title 1', 'Title 2', 'Title 3'] 
    },
    { 
      input: '  Title 1  ,  Title 2  ,  Title 3  ', 
      expected: ['Title 1', 'Title 2', 'Title 3'] 
    },
    { 
      input: 'Single Title', 
      expected: ['Single Title'] 
    },
    { 
      input: 'Title 1,, Title 2, , Title 3', 
      expected: ['Title 1', 'Title 2', 'Title 3'] 
    },
    { 
      input: '', 
      expected: [] 
    }
  ];
  
  testCases.forEach(({ input, expected }) => {
    const result = parseTitles(input);
    const passed = JSON.stringify(result) === JSON.stringify(expected);
    console.log(`${passed ? '✅' : '❌'} "${input}" → [${result.join(', ')}] (expected: [${expected.join(', ')}])`);
  });
}

// Test validateForm function
export function testValidateForm() {
  console.log('Testing validateForm...');
  
  // Mock file object
  const mockFile = { name: 'test.pdf', type: 'application/pdf' } as File;
  
  const testCases = [
    {
      name: 'Valid form',
      file: mockFile,
      grade: '6th-grade',
      unit: 1,
      titles: 'Title 1, Title 2, Title 3',
      pageCount: 3,
      expected: null
    },
    {
      name: 'No file',
      file: null,
      grade: '6th-grade',
      unit: 1,
      titles: 'Title 1',
      pageCount: 1,
      expected: 'Please select a PDF file'
    },
    {
      name: 'No grade',
      file: mockFile,
      grade: '',
      unit: 1,
      titles: 'Title 1',
      pageCount: 1,
      expected: 'Please select a grade'
    },
    {
      name: 'Invalid unit',
      file: mockFile,
      grade: '6th-grade',
      unit: 0,
      titles: 'Title 1',
      pageCount: 1,
      expected: 'Please enter a valid unit number'
    },
    {
      name: 'No titles',
      file: mockFile,
      grade: '6th-grade',
      unit: 1,
      titles: '',
      pageCount: 1,
      expected: 'Please enter page titles'
    },
    {
      name: 'Title count mismatch',
      file: mockFile,
      grade: '6th-grade',
      unit: 1,
      titles: 'Title 1, Title 2',
      pageCount: 3,
      expected: 'Number of titles (2) must match number of PDF pages (3)'
    }
  ];
  
  testCases.forEach(({ name, file, grade, unit, titles, pageCount, expected }) => {
    const result = validateForm(file, grade, unit, titles, pageCount);
    const passed = result === expected;
    console.log(`${passed ? '✅' : '❌'} ${name}: "${result}" (expected: "${expected}")`);
  });
}

// Run all tests
export function runAllTests() {
  console.log('Running PDF Save Tool Tests...\n');
  testSanitizeTitle();
  console.log('');
  testParseTitles();
  console.log('');
  testValidateForm();
  console.log('\nTests completed!');
}

// Auto-run tests if in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Uncomment to run tests automatically
  // runAllTests();
}
