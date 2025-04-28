#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Recursively gets all markdown files from the docs directory and its subdirectories
 * @param dir - The directory to scan
 * @param rootDir - The root docs directory (to ensure we stay within it)
 * @returns List of file paths
 */
function getAllMarkdownFiles(dir: string, rootDir: string): string[] {
  // Ensure we're only scanning within the docs directory
  if (!dir.startsWith(rootDir)) {
    return [];
  }
  
  const files = fs.readdirSync(dir);
  let fileList: string[] = [];
  
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
 * @param docsDir - The root docs directory
 * @returns Combined markdown content
 */
function combineDocumentation(docsDir: string): string {
  // Get all markdown files within the docs directory
  const files = getAllMarkdownFiles(docsDir, docsDir);
  
  // Create the combined content starting with overview if exists
  let combinedContent = '# AI Coaching Platform Documentation\n\n';
  
  // Add table of contents section
  combinedContent += '## Table of Contents\n\n';
  
  // Find architecture-overview.md and place it first if it exists
  const overviewIndex = files.findIndex(file => path.basename(file) === 'architecture-overview.md');
  let overviewFile: string | null = null;
  
  if (overviewIndex !== -1) {
    overviewFile = files[overviewIndex];
    files.splice(overviewIndex, 1); // Remove from the array
  }
  
  // Group files by directory
  const filesByDir: Record<string, string[]> = {};
  
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
 * TypeScript interface for clipboardy module
 */
interface Clipboardy {
  writeSync: (text: string) => void;
}

/**
 * Main function to run the script
 */
async function main(): Promise<void> {
  // Get project path from command line argument or use current directory
  const projectPath = process.argv[2] || process.cwd();
  
  // Configure paths
  const docsDir = path.join(projectPath, 'docs');
  
  // Get user's desktop path
  const desktopDir = path.join(os.homedir(), 'Desktop');
  const outputFile = path.join(desktopDir, 'claude-project-instructions.md');
  
  console.log('Generating combined documentation file...');
  console.log(`Looking for docs in: ${docsDir}`);
  
  // Check if docs directory exists
  if (!fs.existsSync(docsDir)) {
    console.error(`Error: Documentation directory not found at ${docsDir}`);
    console.log('Usage: ts-node generate-docs.ts [project-path]');
    process.exit(1);
  }
  
  // Combine documentation and write to file
  const combinedContent = combineDocumentation(docsDir);
  fs.writeFileSync(outputFile, combinedContent);
  
  const sizeInKB = (combinedContent.length / 1024).toFixed(2);
  console.log(`Combined documentation written to desktop: ${outputFile}`);
  console.log(`Total size: ${sizeInKB} KB`);
  
  try {
    // Handle dynamic import in TypeScript
    try {
      const clipboardy = await import('clipboardy') as unknown as Clipboardy;
      clipboardy.writeSync(combinedContent);
      console.log('Content also copied to clipboard!');
    } catch (error) {
      console.log('Failed to copy to clipboard:', (error as Error).message);
      console.log('If clipboardy is not installed, run: npm install clipboardy');
    }
  } catch (error) {
    console.log('Failed to copy to clipboard:', (error as Error).message);
    console.log('If clipboardy is not installed, run: npm install clipboardy');
  }
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});