#!/bin/bash
# Run the seed script from the solves-coaching project directory
# so that node_modules and tsconfig path aliases are resolved correctly

PROJECT_DIR="$HOME/solves-coaching"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: Project directory not found at $PROJECT_DIR"
  exit 1
fi

cd "$PROJECT_DIR"

# Load environment variables from .env.local (dotenv not installed in project)
if [ -f "$PROJECT_DIR/.env.local" ]; then
  set -a
  source "$PROJECT_DIR/.env.local"
  set +a
else
  echo "Error: .env.local not found at $PROJECT_DIR/.env.local"
  exit 1
fi

# Set NODE_PATH so tsx can find node_modules when running external scripts
export NODE_PATH="$PROJECT_DIR/node_modules"

exec npx tsx --tsconfig "$PROJECT_DIR/tsconfig.json" "$HOME/solves-coaching/.claude/skills/seed-skillshub-data/seed-skillshub-data.ts" "$@"
