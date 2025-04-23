#!/bin/bash

echo "Updating server utility import paths..."

# Create a backup
BACKUP_DIR="src/backup-server-paths-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -R src/app/actions "$BACKUP_DIR/"
cp -R src/app/api "$BACKUP_DIR/"
cp -R src/hooks "$BACKUP_DIR/"

# Update paths in action files
find src/app/actions -type f -name "*.ts" | xargs sed -i '' 's|@/lib/utils/general/server|@/lib/utils/server|g'

# Update paths in API routes
find src/app/api -type f -name "*.ts" | xargs sed -i '' 's|@/lib/utils/general/server|@/lib/utils/server|g'

# Update paths in hooks
find src/hooks -type f -name "*.ts" | xargs sed -i '' 's|@/lib/utils/general/server|@/lib/utils/server|g'

# Update core/api.ts
sed -i '' 's|@/lib/utils/general/server|@/lib/utils/server|g' src/lib/core/api.ts

echo "Server utility import paths updated" 