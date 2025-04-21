# Database Seed Scripts

These scripts populate the MongoDB database with sample data for development and testing purposes.

## Available Scripts

The following seed scripts are available:

- `seed-schools-staff.ts` - Adds sample schools and staff members
- `seed-look-fors.ts` - Adds sample Look-For items and related data
- `seed-cycles-coaching.ts` - Adds sample coaching cycles and coaching logs
- `index.ts` - Main script that runs all seed scripts in sequence with proper error handling

## Running the Scripts

You can run these scripts using the npm commands defined in package.json:

```bash
# Seed schools and staff data
npm run seed:schools-staff

# Seed Look-For data
npm run seed:look-fors

# Seed Cycles and Coaching Logs data
npm run seed:cycles-coaching

# Run all seed scripts in sequence
npm run seed:all
```

The main `seed:all` command uses the `index.ts` script which:
- Runs all scripts in the correct sequence
- Provides clear console output with success/failure indicators
- Handles errors properly and exits with appropriate error codes
- Waits for each script to complete before starting the next

## MongoDB Connection

The scripts connect to MongoDB using the `MONGODB_URI` environment variable. If this variable is not set, they will default to `mongodb://localhost:27017/ai-coaching-platform`.

To connect to a different database, set the `MONGODB_URI` environment variable:

```bash
# Example
MONGODB_URI=mongodb://username:password@host:port/database npm run seed:all
```

## Data Structure

### Schools
- Three sample schools are created (elementary, middle, and high school)
- Each school includes grade levels, basic information, and references to staff members

### Staff Members
- Three NYCPS staff members with various roles and teaching experience
- Two Teaching Lab staff members with different administrative levels and roles

### Look-Fors
- Three sample Look-For evaluation criteria with different topics and rubrics
- Four Look-For Items that reference the parent Look-Fors

### Coaching Cycles and Logs
- Three sample Coaching Cycles with implementation indicators and Look-For items
- Three Coaching Logs representing different types of coaching sessions

## Customization

Feel free to modify these scripts to add more sample data or adjust the existing data to better suit your development needs. The main files to edit are:

- `seed-schools-staff.ts` - For schools and staff data
- `seed-look-fors.ts` - For Look-For evaluation criteria and items
- `seed-cycles-coaching.ts` - For coaching cycles and coaching logs data

## Adding New Seed Scripts

To add a new seed script:

1. Create a new file in the `scripts/seed` directory (e.g., `seed-new-data.ts`)
2. Follow the pattern of the existing scripts
3. Add your script to:
   - The `seedScripts` array in `index.ts`
   - The npm scripts in `package.json`
   - This README file

## Development Notes

These seed scripts use the same model definitions as the application itself, ensuring that the sample data matches the expected schema. If you update the models in the main application, you should also update these seed scripts to match. 