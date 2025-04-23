#!/bin/bash

echo "Updating field config paths..."

# Create a backup
BACKUP_DIR="src/backup-field-config-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -R src/app/dashboard "$BACKUP_DIR/dashboard"

# Update fieldConfig paths
find src/app/dashboard -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/data/forms/fieldConfig|@/lib/data/forms/config|g'

echo "Field config paths updated" 