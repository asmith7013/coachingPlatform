#!/usr/bin/env node
// Disable ESLint for the next line
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// Disable ESLint for the next line
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

/**
 * Recursively gets all markdown files from the docs directory and its subdirectories
 * @param {string} dir - The directory to scan
 * @param {string} rootDir - The root docs directory (to ensure we stay within it)
 * @returns {Array} List of file paths
 */
function getAllMarkdownFiles(dir, rootDir) {
  // Ensure we're only scanning within the docs directory
  if (!dir.startsWith(rootDir)) {
    return [];
  }
  
  const files = fs.readdirSync(dir);
  let fileList = [];
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fileList = fileList.concat(getAllMarkdownFiles(filePath, rootDir));
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Combines all markdown files into a single large document
 * @param {string} docsDir - The root docs directory
 * @returns {string} Combined markdown content
 */
function combineDocumentation(docsDir) {
  // Get all markdown files within the docs directory
  let files = getAllMarkdownFiles(docsDir, docsDir);
  
  // Create the combined content starting with overview if exists
  let combinedContent = '# AI Coaching Platform Documentation\n\n';
  
  // Add table of contents section
  combinedContent += '## Table of Contents\n\n';
  
  // Find architecture-overview.md and place it first if it exists
  const overviewIndex = files.findIndex(file => path.basename(file) === 'architecture-overview.md');
  let overviewFile = null;
  
  if (overviewIndex !== -1) {
    overviewFile = files[overviewIndex];
    files.splice(overviewIndex, 1); // Remove from the array
  }
  
  // Group files by directory
  const filesByDir = {};
  
  files.forEach(file => {
    const dir = path.dirname(file);
    const relativeDirPath = path.relative(docsDir, dir);
    
    if (!filesByDir[relativeDirPath]) {
      filesByDir[relativeDirPath] = [];
    }
    
    filesByDir[relativeDirPath].push(file);
  });
  
  // Define the order of directories
  const dirOrder = [
    '.', // Root docs directory
    'architecture',
    'components',
    'data-flow',
    'workflows',
    'examples'
  ];
  
  // Generate table of contents
  dirOrder.forEach(dir => {
    if (dir === '.' && overviewFile) {
      combinedContent += `- [Architecture Overview](#architecture-overview)\n`;
    }
    
    if (filesByDir[dir]) {
      const dirName = dir === '.' ? 'Root' : dir.charAt(0).toUpperCase() + dir.slice(1);
      combinedContent += `- [${dirName}](#${dir.replace(/\//g, '-')})\n`;
      
      // Sort files within each directory
      filesByDir[dir].sort();
      
      filesByDir[dir].forEach(file => {
        const fileName = path.basename(file, '.md');
        const anchor = fileName.replace(/\s+/g, '-').toLowerCase();
        combinedContent += `  - [${fileName.replace(/-/g, ' ')}](#${anchor})\n`;
      });
    }
  });
  
  combinedContent += '\n\n';
  
  // Add overview first if it exists
  if (overviewFile) {
    const content = fs.readFileSync(overviewFile, 'utf8');
    combinedContent += '<a id="architecture-overview"></a>\n\n';
    combinedContent += '# Architecture Overview\n\n';
    combinedContent += content;
    combinedContent += '\n\n---\n\n';
  }
  
  // Add content from each directory in the specified order
  dirOrder.forEach(dir => {
    if (filesByDir[dir]) {
      const dirName = dir === '.' ? 'Root Documents' : dir.charAt(0).toUpperCase() + dir.slice(1);
      combinedContent += `<a id="${dir.replace(/\//g, '-')}"></a>\n\n`;
      combinedContent += `# ${dirName}\n\n`;
      
      // Sort files within each directory
      filesByDir[dir].sort();
      
      filesByDir[dir].forEach(file => {
        const fileName = path.basename(file, '.md');
        const content = fs.readFileSync(file, 'utf8');
        const anchor = fileName.replace(/\s+/g, '-').toLowerCase();
        
        combinedContent += `<a id="${anchor}"></a>\n\n`;
        combinedContent += `## ${fileName.replace(/-/g, ' ')}\n\n`;
        combinedContent += content;
        combinedContent += '\n\n---\n\n';
      });
    }
  });
  
  return combinedContent;
}

/**
 * Main function to run the script
 */
function main() {
  // Configure paths
  const rootDir = process.env.PROJECT_ROOT || path.resolve(__dirname, '..');
  const docsDir = path.join(rootDir, 'docs');
  const outputDir = path.join(rootDir, 'docs-export');
  const outputFile = path.join(outputDir, 'claude-project-instructions.md');
  
  console.log('Generating combined documentation file...');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  // Combine documentation and write to file
  const combinedContent = combineDocumentation(docsDir);
  fs.writeFileSync(outputFile, combinedContent);
  
  const sizeInKB = (combinedContent.length / 1024).toFixed(2);
  console.log(`Combined documentation written to: ${outputFile}`);
  console.log(`Total size: ${sizeInKB} KB`);
  
  try {
    // Use dynamic import instead of require
    import('clipboardy').then(clipboardy => {
      clipboardy.writeSync(combinedContent);
      console.log('Content also copied to clipboard!');
    }).catch(error => {
      console.log('Failed to copy to clipboard:', error.message);
      console.log('If clipboardy is not installed, run: npm install clipboardy');
    });
  } catch (error) {
    console.log('Failed to copy to clipboard:', error.message);
    console.log('If clipboardy is not installed, run: npm install clipboardy');
  }
}

// Run the script
main();