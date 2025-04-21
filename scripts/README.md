# Scripts Directory

This directory contains utility scripts for the AI Coaching Platform.

## Available Scripts

- [`generate-theme-css.ts`](./generate-theme-css.ts) - Generates CSS variables for the theme
- [`seed/`](./seed/) - Database seed scripts for development and testing

## Database Seed Scripts

The [`seed/`](./seed/) directory contains scripts for populating the MongoDB database with sample data:

- `seed-schools-staff.ts` - Adds sample schools and staff members
- `seed-look-fors.ts` - Adds sample Look-For items and related data
- `seed-cycles-coaching.ts` - Adds sample coaching cycles and coaching logs
- `index.ts` - Main script that runs all seed scripts in sequence

To run all seed scripts:

```bash
npm run seed:all
```

For more details on the seed scripts, see the [seed directory README](./seed/README.md).

## Adding New Scripts

When adding new scripts to this directory:

1. Follow the existing naming conventions
2. Add appropriate documentation in this README
3. Add npm scripts in package.json if needed
4. Include proper error handling and logging

## Usage

Most scripts can be run directly with the `tsx` command:

```bash
npx tsx scripts/script-name.ts
```

Or via npm scripts defined in `package.json`:

```bash
npm run script-name
``` 