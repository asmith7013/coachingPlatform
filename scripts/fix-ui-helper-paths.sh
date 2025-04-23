#!/bin/bash

echo "Updating UI helper import paths..."

# Fix tokenHelpers imports
sed -i '' 's|from "./tokens/typography"|from "../tokens/typography"|g' src/lib/ui/helpers/tokenHelpers.ts
sed -i '' 's|from "./tokens/text"|from "../tokens/text"|g' src/lib/ui/helpers/tokenHelpers.ts
sed -i '' 's|from "./tokens/shape"|from "../tokens/shape"|g' src/lib/ui/helpers/tokenHelpers.ts
sed -i '' 's|from "./tokens/spacing"|from "../tokens/spacing"|g' src/lib/ui/helpers/tokenHelpers.ts
sed -i '' 's|from "./tokens/colors"|from "../tokens/colors"|g' src/lib/ui/helpers/tokenHelpers.ts

# Fix variants common import
sed -i '' 's|from "../utils/variantHelpers"|from "../helpers/variantHelpers"|g' src/lib/ui/variants/common.ts

echo "UI helper import paths updated" 