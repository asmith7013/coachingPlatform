#!/bin/bash

echo "Updating type reference import paths..."

# Create a backup
BACKUP_DIR="src/backup-type-paths-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -R src/components "$BACKUP_DIR/components"
cp -R src/hooks "$BACKUP_DIR/hooks"

# Update @/lib/types/core references to @/lib/core/types
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/types/core|@/lib/core/types|g'

# Update @/lib/types/api references to @/lib/core/types/api
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/types/api|@/lib/core/types/api|g'

echo "Type reference import paths updated" 