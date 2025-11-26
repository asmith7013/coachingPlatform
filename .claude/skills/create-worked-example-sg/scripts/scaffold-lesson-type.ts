#!/usr/bin/env tsx
/**
 * Scaffold a new lesson type with all required files
 *
 * Usage: tsx scripts/scaffold-lesson-type.ts <lesson-type-name> [options]
 *
 * Example: tsx scripts/scaffold-lesson-type.ts interactive-demo --grade-levels 6,7,8
 *
 * Creates:
 * - Zod schema (src/lib/schema/zod-schema/<name>.ts)
 * - Mongoose model (src/lib/schema/mongoose-schema/<name>.model.ts)
 * - Server actions (src/app/actions/<name>/)
 * - Viewer pages (src/app/<name>/)
 * - Claude skill (/.claude/skills/<name>/)
 * - Documentation
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

interface ScaffoldOptions {
  lessonType: string;
  gradeLevels?: number[];
  hasSlides?: boolean;
  hasVideo?: boolean;
  hasInteractive?: boolean;
}

const toPascalCase = (str: string): string => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

const toCamelCase = (str: string): string => {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

async function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

// ============================================================================
// Template Generators
// ============================================================================

function generateZodSchema(lessonType: string): string {
  const pascalName = toPascalCase(lessonType);

  return `import { z } from 'zod';

// Base ${pascalName} Schema
export const ${pascalName}Schema = z.object({
  _id: z.string().optional(),

  // Basic Info
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),

  // Educational Context
  mathConcept: z.string(),
  mathStandard: z.string(),
  gradeLevel: z.number().min(6).max(12),

  // Content - customize based on your lesson type
  content: z.object({
    // TODO: Define your content structure here
    description: z.string(),
  }),

  // Metadata
  createdBy: z.string().optional(),
  isPublic: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create Input Schema (excludes auto-generated fields)
export const Create${pascalName}Schema = ${pascalName}Schema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript Types
export type ${pascalName} = z.infer<typeof ${pascalName}Schema>;
export type Create${pascalName}Input = z.infer<typeof Create${pascalName}Schema>;
`;
}

function generateMongooseModel(lessonType: string): string {
  const pascalName = toPascalCase(lessonType);
  const camelName = toCamelCase(lessonType);

  return `import mongoose, { Schema, type Model } from 'mongoose';
import type { ${pascalName} } from '@zod-schema/${lessonType}';

const ${camelName}Schema = new Schema<${pascalName}>(
  {
    // Basic Info
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    // Educational Context
    mathConcept: { type: String, required: true },
    mathStandard: { type: String, required: true },
    gradeLevel: { type: Number, required: true },

    // Content - customize based on your lesson type
    content: {
      description: { type: String, required: true },
      // TODO: Add more fields as needed
    },

    // Metadata
    createdBy: { type: String, required: false },
    isPublic: { type: Boolean, default: false },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: '${lessonType.replace(/-/g, '-')}s',
  }
);

// Indexes
${camelName}Schema.index({ slug: 1 });
${camelName}Schema.index({ gradeLevel: 1 });
${camelName}Schema.index({ mathConcept: 1 });
${camelName}Schema.index({ createdBy: 1 });
${camelName}Schema.index({ isPublic: 1 });

// Text search
${camelName}Schema.index({
  title: 'text',
  mathConcept: 'text',
  mathStandard: 'text',
});

// Transform _id to id for client-side use
${camelName}Schema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

// Conditional export pattern (prevents model recompilation in dev)
export const ${pascalName} =
  (mongoose.models.${pascalName} as Model<${pascalName}>) ||
  mongoose.model<${pascalName}>('${pascalName}', ${camelName}Schema);
`;
}

function generateSaveAction(lessonType: string): string {
  const pascalName = toPascalCase(lessonType);

  return `"use server";

import { withDbConnection } from '@server/db/ensure-connection';
import { ${pascalName} } from '@mongoose-schema/${lessonType}.model';
import { Create${pascalName}Schema, type Create${pascalName}Input } from '@zod-schema/${lessonType}';
import { auth } from '@clerk/nextjs/server';
import { handleServerError } from '@error/handlers/server';

export async function save${pascalName}(data: Create${pascalName}Input) {
  return withDbConnection(async () => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      // Validate input
      const validated = Create${pascalName}Schema.parse(data);

      // Check for duplicate slug
      const existing = await ${pascalName}.findOne({ slug: validated.slug });
      if (existing) {
        return {
          success: false,
          error: \`A ${lessonType} with slug "\${validated.slug}" already exists\`,
        };
      }

      // Create new document
      const newItem = await ${pascalName}.create({
        ...validated,
        createdBy: userId,
      });

      return {
        success: true,
        data: newItem.toJSON(),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to save ${lessonType}'),
      };
    }
  });
}
`;
}

function generateGetAction(lessonType: string): string {
  const pascalName = toPascalCase(lessonType);

  return `"use server";

import { withDbConnection } from '@server/db/ensure-connection';
import { ${pascalName} } from '@mongoose-schema/${lessonType}.model';
import { auth } from '@clerk/nextjs/server';
import { handleServerError } from '@error/handlers/server';

export async function get${pascalName}BySlug(slug: string) {
  return withDbConnection(async () => {
    try {
      const { userId } = await auth();

      const item = await ${pascalName}.findOne({ slug });

      if (!item) {
        return {
          success: false,
          error: '${pascalName} not found',
        };
      }

      // Check permissions - public items OR owned by user
      if (!item.isPublic && item.createdBy !== userId) {
        return {
          success: false,
          error: 'Access denied',
        };
      }

      return {
        success: true,
        data: item.toJSON(),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to get ${lessonType}'),
      };
    }
  });
}

export async function get${pascalName}ById(id: string) {
  return withDbConnection(async () => {
    try {
      const { userId } = await auth();

      const item = await ${pascalName}.findById(id);

      if (!item) {
        return {
          success: false,
          error: '${pascalName} not found',
        };
      }

      // Check permissions
      if (!item.isPublic && item.createdBy !== userId) {
        return {
          success: false,
          error: 'Access denied',
        };
      }

      return {
        success: true,
        data: item.toJSON(),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to get ${lessonType}'),
      };
    }
  });
}
`;
}

function generateListAction(lessonType: string): string {
  const pascalName = toPascalCase(lessonType);

  return `"use server";

import { withDbConnection } from '@server/db/ensure-connection';
import { ${pascalName} } from '@mongoose-schema/${lessonType}.model';
import { auth } from '@clerk/nextjs/server';
import { handleServerError } from '@error/handlers/server';

interface ListFilters {
  gradeLevel?: number;
  mathConcept?: string;
  mathStandard?: string;
  createdBy?: string;
  isPublic?: boolean;
  limit?: number;
  skip?: number;
}

export async function list${pascalName}s(filters?: ListFilters) {
  return withDbConnection(async () => {
    try {
      const { userId } = await auth();

      const query: Record<string, unknown> = {};

      // Apply filters
      if (filters?.gradeLevel) {
        query.gradeLevel = filters.gradeLevel;
      }

      if (filters?.mathConcept) {
        query.mathConcept = filters.mathConcept;
      }

      if (filters?.mathStandard) {
        query.mathStandard = filters.mathStandard;
      }

      if (filters?.createdBy) {
        query.createdBy = filters.createdBy;
      }

      // Visibility filter - show public items + user's own items
      if (filters?.isPublic !== undefined) {
        query.isPublic = filters.isPublic;
      } else if (userId) {
        query.$or = [
          { isPublic: true },
          { createdBy: userId },
        ];
      } else {
        query.isPublic = true;
      }

      const items = await ${pascalName}
        .find(query)
        .sort({ createdAt: -1 })
        .limit(filters?.limit || 50)
        .skip(filters?.skip || 0)
        .select('title slug mathConcept mathStandard gradeLevel createdBy isPublic createdAt');

      const total = await ${pascalName}.countDocuments(query);

      return {
        success: true,
        data: items.map(item => item.toJSON()),
        pagination: {
          total,
          limit: filters?.limit || 50,
          skip: filters?.skip || 0,
          hasMore: (filters?.skip || 0) + (filters?.limit || 50) < total,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to list ${lessonType}s'),
      };
    }
  });
}
`;
}

function generateActionsIndex(lessonType: string): string {
  const pascalName = toPascalCase(lessonType);

  return `export { save${pascalName} } from './save';
export { get${pascalName}BySlug, get${pascalName}ById } from './get';
export { list${pascalName}s } from './list';
`;
}

function generateSkillMd(lessonType: string): string {
  const pascalName = toPascalCase(lessonType);

  return `# Create ${pascalName}

You are an expert educational content creator specializing in mathematics pedagogy.

Your task is to generate content for a ${pascalName} lesson and save it to the database.

## Input

The user will provide:
1. **A description or image of the lesson concept**
2. Optionally: Grade level, math standard, or specific learning objective

## Your Process

### Step 1: Analyze the Lesson Requirements

Extract:
- Mathematical concept (e.g., solving equations, graphing functions)
- Grade level and relevant math standard
- Key learning objectives
- Appropriate pedagogical approach

### Step 2: Generate Lesson Content

Create content that is:
- Age-appropriate for the grade level
- Aligned with math standards
- Pedagogically sound
- Engaging and clear

### Step 3: Validate Against Schema

Ensure your data matches the structure defined in the Zod schema at:
\`src/lib/schema/zod-schema/${lessonType}.ts\`

### Step 4: Save to Database

Import and use the server action:

\`\`\`typescript
import { save${pascalName} } from '@actions/${lessonType}';
import type { Create${pascalName}Input } from '@zod-schema/${lessonType}';

const lessonData: Create${pascalName}Input = {
  title: "...",
  slug: "...", // kebab-case URL-safe version of title
  mathConcept: "...",
  mathStandard: "...",
  gradeLevel: 7,
  isPublic: true,
  content: {
    description: "...",
    // ... other content fields
  }
};

const result = await save${pascalName}(lessonData);

if (result.success) {
  // Provide user with success message
} else {
  // Handle error
}
\`\`\`

## Output

Provide the user with:
1. **Summary** of the lesson created
2. **Key content** generated
3. **Next steps** for viewing or editing

## Quality Checklist

Before saving, verify:
- ✅ All required fields present
- ✅ Content is age-appropriate
- ✅ Math is accurate
- ✅ Follows educational best practices
- ✅ Data structure matches schema
`;
}

function generateValidationScript(lessonType: string): string {
  const pascalName = toPascalCase(lessonType);

  return `#!/usr/bin/env tsx
/**
 * Validate all ${pascalName}s in the database
 *
 * Usage: tsx scripts/validate-${lessonType}s.ts
 */

import mongoose from 'mongoose';
import { ${pascalName} } from '../src/lib/schema/mongoose-schema/${lessonType}.model';
import { ${pascalName}Schema } from '../src/lib/schema/zod-schema/${lessonType}';

async function validateAll${pascalName}s() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }

  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(dbUrl);
    console.log('✅ Connected\\n');

    const items = await ${pascalName}.find({});
    console.log(\`📊 Found \${items.length} ${lessonType}(s)\\n\`);

    let validCount = 0;
    let invalidCount = 0;

    for (const item of items) {
      try {
        // Convert to plain object
        const plainItem = item.toJSON();

        // Validate against Zod schema
        ${pascalName}Schema.parse(plainItem);

        console.log(\`✅ \${item.title} (\${item.slug})\`);
        validCount++;
      } catch (error) {
        console.error(\`❌ \${item.title} (\${item.slug})\`);
        if (error instanceof Error) {
          console.error(\`   Error: \${error.message}\`);
        }
        invalidCount++;
      }
    }

    console.log(\`\\n📈 Summary:\`);
    console.log(\`   Valid: \${validCount}\`);
    console.log(\`   Invalid: \${invalidCount}\`);
    console.log(\`   Total: \${items.length}\`);

    await mongoose.disconnect();
    process.exit(invalidCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

validateAll${pascalName}s();
`;
}

function generateReadme(lessonType: string): string {
  const pascalName = toPascalCase(lessonType);

  return `# ${pascalName} - Implementation Guide

This directory contains the complete implementation for ${pascalName} lessons.

## Architecture

### Database Schema
- **Zod Schema**: \`src/lib/schema/zod-schema/${lessonType}.ts\`
  - Validation and TypeScript types
  - Used for input validation

- **Mongoose Model**: \`src/lib/schema/mongoose-schema/${lessonType}.model.ts\`
  - Database schema and indexes
  - Collection: \`${lessonType}s\`

### Server Actions
Located in \`src/app/actions/${lessonType}/\`:
- \`save.ts\` - Create new ${lessonType}
- \`get.ts\` - Get by slug or ID
- \`list.ts\` - List with filters

### Viewer Pages
Located in \`src/app/${lessonType}/\`:
- \`page.tsx\` - List view
- \`[slug]/page.tsx\` - Individual ${lessonType} viewer

### Claude Skill
Located in \`.claude/skills/${lessonType}/\`:
- \`skill.md\` - Main skill prompt
- Use: Invoke with \`/${lessonType}\` command

## Usage

### Creating a ${pascalName}

\`\`\`typescript
import { save${pascalName} } from '@actions/${lessonType}';

const result = await save${pascalName}({
  title: "Example Lesson",
  slug: "example-lesson",
  mathConcept: "Linear Equations",
  mathStandard: "8.EE.B.5",
  gradeLevel: 8,
  isPublic: true,
  content: {
    description: "Learn to solve linear equations",
  }
});
\`\`\`

### Retrieving ${pascalName}s

\`\`\`typescript
import { get${pascalName}BySlug, list${pascalName}s } from '@actions/${lessonType}';

// Get single item
const item = await get${pascalName}BySlug('example-lesson');

// List items
const items = await list${pascalName}s({
  gradeLevel: 8,
  limit: 20
});
\`\`\`

## Validation

Run validation on all ${lessonType}s in the database:

\`\`\`bash
tsx scripts/validate-${lessonType}s.ts
\`\`\`

## Customization

To customize the schema:
1. Edit \`src/lib/schema/zod-schema/${lessonType}.ts\`
2. Update \`src/lib/schema/mongoose-schema/${lessonType}.model.ts\`
3. Run validation script to check existing data
4. Update skill prompt as needed

## Next Steps

- [ ] Customize content structure in schemas
- [ ] Add viewer page components
- [ ] Enhance Claude skill prompt
- [ ] Add additional server actions as needed
- [ ] Create example ${lessonType}s for testing
`;
}

// ============================================================================
// Main Scaffolding Function
// ============================================================================

async function scaffoldLessonType(options: ScaffoldOptions) {
  const { lessonType } = options;
  const pascalName = toPascalCase(lessonType);

  console.log(`\n🏗️  Scaffolding ${pascalName} lesson type...\n`);

  const baseDir = process.cwd();

  // Create directory structure
  const dirs = [
    path.join(baseDir, 'src/lib/schema/zod-schema'),
    path.join(baseDir, 'src/lib/schema/mongoose-schema'),
    path.join(baseDir, `src/app/actions/${lessonType}`),
    path.join(baseDir, `.claude/skills/${lessonType}`),
    path.join(baseDir, 'scripts'),
  ];

  for (const dir of dirs) {
    await ensureDir(dir);
  }

  // Generate files
  const files = [
    {
      path: path.join(baseDir, `src/lib/schema/zod-schema/${lessonType}.ts`),
      content: generateZodSchema(lessonType),
      description: 'Zod schema',
    },
    {
      path: path.join(baseDir, `src/lib/schema/mongoose-schema/${lessonType}.model.ts`),
      content: generateMongooseModel(lessonType),
      description: 'Mongoose model',
    },
    {
      path: path.join(baseDir, `src/app/actions/${lessonType}/save.ts`),
      content: generateSaveAction(lessonType),
      description: 'Save action',
    },
    {
      path: path.join(baseDir, `src/app/actions/${lessonType}/get.ts`),
      content: generateGetAction(lessonType),
      description: 'Get action',
    },
    {
      path: path.join(baseDir, `src/app/actions/${lessonType}/list.ts`),
      content: generateListAction(lessonType),
      description: 'List action',
    },
    {
      path: path.join(baseDir, `src/app/actions/${lessonType}/index.ts`),
      content: generateActionsIndex(lessonType),
      description: 'Actions index',
    },
    {
      path: path.join(baseDir, `.claude/skills/${lessonType}/skill.md`),
      content: generateSkillMd(lessonType),
      description: 'Claude skill',
    },
    {
      path: path.join(baseDir, `scripts/validate-${lessonType}s.ts`),
      content: generateValidationScript(lessonType),
      description: 'Validation script',
    },
    {
      path: path.join(baseDir, `.claude/skills/${lessonType}/README.md`),
      content: generateReadme(lessonType),
      description: 'Documentation',
    },
  ];

  for (const file of files) {
    await writeFile(file.path, file.content, 'utf-8');
    console.log(`✅ Created ${file.description}: ${path.relative(baseDir, file.path)}`);
  }

  console.log(`\n✨ Successfully scaffolded ${pascalName}!\n`);
  console.log('📝 Next steps:');
  console.log(`   1. Customize content structure in src/lib/schema/zod-schema/${lessonType}.ts`);
  console.log(`   2. Update Mongoose model to match Zod schema`);
  console.log(`   3. Create viewer pages in src/app/${lessonType}/`);
  console.log(`   4. Enhance Claude skill in .claude/skills/${lessonType}/skill.md`);
  console.log(`   5. Run validation: tsx scripts/validate-${lessonType}s.ts\n`);
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
Usage: tsx scripts/scaffold-lesson-type.ts <lesson-type-name> [options]

Examples:
  tsx scripts/scaffold-lesson-type.ts interactive-demo
  tsx scripts/scaffold-lesson-type.ts video-lesson --grade-levels 6,7,8

Options:
  --grade-levels <levels>  Comma-separated grade levels (default: 6-12)
  --help, -h              Show this help message
  `);
  process.exit(0);
}

const lessonType = args[0];
const options: ScaffoldOptions = {
  lessonType,
};

// Parse options
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--grade-levels' && args[i + 1]) {
    options.gradeLevels = args[i + 1].split(',').map(Number);
    i++;
  }
}

scaffoldLessonType(options).catch(console.error);
