// scripts/generate-theme-css.ts
import fs from "fs";
import path from "path";
import { tailwindColors, semanticColorMap } from "@/lib/ui/tokens/semantic-colors";

const GLOBALS_PATH = path.resolve(__dirname, "../src/app/globals.css");

const generateThemeBlock = (): string[] => {
  const lines = ["@theme {"];

  for (const [semantic, baseColor] of Object.entries(semanticColorMap)) {
    const shades = tailwindColors[baseColor as keyof typeof tailwindColors];
    if (!shades) {
      console.warn(`⚠️ No color data found for base color: ${baseColor}`);
      continue;
    }

    for (const [shade, hex] of Object.entries(shades)) {
      const suffix = shade === "DEFAULT" ? "" : `-${shade}`;
      lines.push(`  --color-${semantic}${suffix}: ${hex};`);
    }
  }

  lines.push("}");
  return lines;
};

const updateGlobalsCss = () => {
  const file = fs.readFileSync(GLOBALS_PATH, "utf8");
  const themeBlockRegex = /@theme\s*{[\s\S]*?}/gm;
  const newThemeBlock = generateThemeBlock().join("\n");

  let newFile: string;

  if (themeBlockRegex.test(file)) {
    newFile = file.replace(themeBlockRegex, newThemeBlock);
  } else {
    const importRegex = /@import\s+["']tailwindcss["'];/;
    if (!importRegex.test(file)) {
      throw new Error("Could not find @import 'tailwindcss'; in globals.css");
    }
    newFile = file.replace(importRegex, match => `${match}\n\n${newThemeBlock}`);
  }

  fs.writeFileSync(GLOBALS_PATH, newFile, { encoding: "utf8" });
  console.log("✅ Updated globals.css with new @theme block");
};

updateGlobalsCss();