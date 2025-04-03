import fs from 'fs'
import path from 'path'
import * as tokens from '../src/lib/ui/tokens'

// 🎯 Extract Tailwind-compatible classes from token strings using regex
const extractClasses = (obj: Record<string, string> | undefined): string[] => {
  if (!obj) return []
  const classRegex = /[a-z-:]+\[.*?\]|[a-z-]+/g
  return Object.values(obj)
    .flatMap((value) =>
      Array.from(value.matchAll(classRegex)).map((m) => m[0])
    )
    .filter(Boolean)
}

// 🧱 Pull all token class strings
const rawClasses = [
  ...extractClasses(tokens.textColors),
  ...extractClasses(tokens.backgroundColors),
  ...extractClasses(tokens.borderColors),
  ...extractClasses(tokens.spacing),
  ...extractClasses(tokens.fontSizes),
  ...extractClasses(tokens.radii),
  ...extractClasses(tokens.sizeVariants),
  ...extractClasses(tokens.borderWidths),
  ...extractClasses(tokens.borderStyles),
  ...extractClasses(tokens.leading),
  ...extractClasses(tokens.spacingY),
  ...extractClasses(tokens.shadows),
]

// ✨ Add hover: variants for background colors only
const hoverVariants = rawClasses
  .filter((cls) => cls.startsWith('bg-['))
  .map((cls) => `hover:${cls}`)

// 🧼 Deduplicate + Sort
const fullSafelist = Array.from(new Set([...rawClasses, ...hoverVariants])).sort()

// 📝 Write to JSON file
fs.writeFileSync(
  path.join(__dirname, '../tailwind.safelist.json'),
  JSON.stringify(fullSafelist, null, 2)
)

console.log(`✅ Safelist generated with ${fullSafelist.length} classes.`)