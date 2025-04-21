/**
 * Main seed script that runs all seed scripts in the correct order
 * 
 * Usage:
 * ```
 * npm run seed:all
 * ```
 * 
 * Or run directly:
 * ```
 * tsx scripts/seed/index.ts
 * ```
 */

import { spawn } from 'child_process';
import path from 'path';

const seedScripts = [
  'seed-schools-staff.ts',
  'seed-look-fors.ts',
  'seed-cycles-coaching.ts'
];

/**
 * Runs a script using the tsx command
 * @param script The script filename to run
 * @returns A promise that resolves when the script completes
 */
function runScript(script: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n\n=========================================`);
    console.log(`Running ${script}...`);
    console.log(`=========================================\n`);

    const scriptPath = path.join(__dirname, script);
    const child = spawn('npx', ['tsx', scriptPath], { stdio: 'inherit', shell: true });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${script} completed successfully\n`);
        resolve();
      } else {
        console.error(`\n❌ ${script} failed with code ${code}\n`);
        reject(new Error(`Script ${script} failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      console.error(`\n❌ Failed to run ${script}: ${err.message}\n`);
      reject(err);
    });
  });
}

/**
 * Runs all seed scripts in sequence
 */
async function runAllScripts() {
  try {
    console.log(`Starting database seeding process...`);
    console.log(`Using MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-coaching-platform'}`);

    for (const script of seedScripts) {
      await runScript(script);
    }

    console.log(`\n\n=========================================`);
    console.log(`🎉 All seed scripts completed successfully!`);
    console.log(`=========================================\n`);
  } catch (error) {
    console.error(`\n\n=========================================`);
    console.error(`❌ Seeding process failed:`);
    console.error(error);
    console.error(`=========================================\n`);
    process.exit(1);
  }
}

// Run all scripts if this file is executed directly
if (require.main === module) {
  runAllScripts();
}

export { runAllScripts, runScript }; 