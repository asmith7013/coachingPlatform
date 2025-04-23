#!/bin/bash

echo "Updating miscellaneous import paths..."

# Create a backup
BACKUP_DIR="src/backup-misc-paths-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -R src/app/tools "$BACKUP_DIR/tools"

# Update JSON imports
find src/app/tools -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@lib/json/|@/lib/data/json/|g'

# Update hooks/usePersistedCurriculumVersion
find src/app/tools -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/hooks/usePersistedCurriculumVersion|@/lib/data/hooks/usePersistedCurriculumVersion|g'

# Update FilterableGridView hook import
sed -i '' 's|@/lib/hooks/useItemToGroupMap|@/lib/data/hooks/useItemToGroupMap|g' src/components/shared/FilterableGridView.tsx

# Update performance import in layout
sed -i '' 's|@/lib/performance|@/lib/core/performance|g' src/app/layout.tsx

echo "Miscellaneous import paths updated" 