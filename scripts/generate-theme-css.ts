import { writeFileSync } from "fs";
import { join } from "path";
import { designTokens } from "../src/lib/ui/designTokens";

type TokenValue = string | number | boolean | null | undefined;
interface DesignToken {
  [key: string]: TokenValue | DesignToken;
}

/**
 * Recursively flattens design tokens into CSS variables
 * Converts camelCase to kebab-case for CSS variable names
 */
const flattenTokens = (
  tokens: DesignToken,
  prefix: string = ""
): string[] => {
  return Object.entries(tokens).flatMap(([key, value]) => {
    // Convert camelCase to kebab-case
    const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    const variableName = `--${prefix}${kebabKey}`;

    if (typeof value === "object" && value !== null) {
      return flattenTokens(value as DesignToken, `${prefix}${kebabKey}-`);
    }

    return `${variableName}: ${value};`;
  });
};

// Flatten all tokens into CSS variables
const cssVariables = flattenTokens(designTokens);

// Generate CSS content with @theme block
const cssContent = `/* Auto-generated theme CSS - DO NOT EDIT DIRECTLY */
/* Generated from designTokens.ts */

@theme {
${cssVariables.map((line) => `  ${line}`).join("\n")}
}
`;

// Write to theme.css
const themePath = join(process.cwd(), "src", "styles", "theme.css");
writeFileSync(themePath, cssContent, "utf-8");

console.log("✅ Tailwind theme.css generated!");