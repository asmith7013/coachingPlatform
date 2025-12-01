#!/bin/bash

# Link Question Type Scripts to Public Directory
# This script creates symlinks from question-type snippets to public/scripts/
# so they can be loaded by the browser without manual copying

set -e

SCRIPTS_DIR="/Users/alexsmith/ai-coaching-platform/public/scripts"
QUESTION_TYPES_DIR="/Users/alexsmith/ai-coaching-platform/.claude/skills/question-types"

echo "Linking question-type scripts to public/scripts/..."

# Ensure scripts directory exists
mkdir -p "$SCRIPTS_DIR"

# Link coordinate-plane-p5.js (dynamic graph)
ln -sf "$QUESTION_TYPES_DIR/implement-dynamic-graph-question/snippets/coordinate-plane-p5.js" \
       "$SCRIPTS_DIR/coordinate-plane-p5.js"
echo "✓ Linked coordinate-plane-p5.js"

# Link static-graph.js (static graph)
ln -sf "$QUESTION_TYPES_DIR/implement-static-graph-question/snippets/static-graph.js" \
       "$SCRIPTS_DIR/static-graph.js"
echo "✓ Linked static-graph.js"

# Link double-number-line.js
ln -sf "$QUESTION_TYPES_DIR/implement-double-number-line-question/snippets/double-number-line.js" \
       "$SCRIPTS_DIR/double-number-line.js"
echo "✓ Linked double-number-line.js"

# Link tables.js
ln -sf "$QUESTION_TYPES_DIR/implement-table-question/snippets/tables.js" \
       "$SCRIPTS_DIR/tables.js"
echo "✓ Linked tables.js"

echo ""
echo "All question-type scripts linked successfully!"
echo "You can now edit files in .claude/skills/question-types/ and see changes immediately."
