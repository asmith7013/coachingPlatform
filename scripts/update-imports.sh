#!/bin/bash

echo "Updating import paths for reorganized lib structure..."

# Create a backup directory
BACKUP_DIR="src/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -R src/* "$BACKUP_DIR/"

echo "Created backup at $BACKUP_DIR"

# Create domains directory if it doesn't exist
mkdir -p src/lib/domains/imRoutine

# Update zod-schema imports to data/schemas
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/zod-schema|@/lib/data/schemas|g'

# Update ui-schema imports to data/forms
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/ui-schema|@/lib/data/forms|g'

# Update server-utils imports to utils/server
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/server-utils|@/lib/utils/server|g'

# Update dev-utils imports to utils/dev
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/dev-utils|@/lib/utils/dev|g'

# Update error imports to core/error
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/error|@/lib/core/error|g'

# Update DB import
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/db|@/lib/core/db|g'

# Update apiHandler import
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/apiHandler|@/lib/core/api|g'

# Update common utility imports
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/utils|@/lib/utils/general|g'

# Update imRoutine imports
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/imRoutine|@/lib/domains/imRoutine|g'

# Update JSON imports
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/json|@/lib/data/json|g'

# Fix UI library internal references
find src/lib/ui -type f -name "*.ts" | xargs sed -i '' 's|from "./tokens|from "../tokens|g'
find src/lib/ui -type f -name "*.ts" | xargs sed -i '' 's|from "./utils/variantHelpers"|from "./variantHelpers"|g'
find src/lib/ui -type f -name "*.ts" | xargs sed -i '' 's|from "../utils/variantHelpers"|from "../helpers/variantHelpers"|g'

echo "Import paths updated, please rebuild and test the application" 