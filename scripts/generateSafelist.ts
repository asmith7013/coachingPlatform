import fs from 'fs'
import path from 'path'
import * as tokens from '../src/lib/ui/tokens'

// 🎯 Extract Tailwind-compatible classes from token strings using regex
const extractClasses = (obj: Record<string, string>): string[] => {
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
  ...extractClasses(tokens.colorVariants),
  ...extractClasses(tokens.spacing),
  ...extractClasses(tokens.fontSizes),
  ...extractClasses(tokens.radii),
  ...extractClasses(tokens.sizeVariants),
  ...extractClasses(tokens.borderWidths),
  ...extractClasses(tokens.borderStyles),
  ...extractClasses(tokens.borderColors),
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


// import fs from 'fs'
// import path from 'path'

// // Pull from your full Tailwind token layer
// import * as tokens from '../src/lib/ui/tokens'

// // Utility to flatten objects into string arrays of classes
// const extractClasses = (obj: Record<string, string>): string[] =>
//   Object.values(obj).flatMap((value) =>
//     value.split(' ').filter((cls) => cls.trim().length > 0)
//   )

// // Extract raw utility classes from tokens
// const safelist = [
//   ...extractClasses(tokens.textColors),
//   ...extractClasses(tokens.colorVariants),
//   ...extractClasses(tokens.spacing),
//   ...extractClasses(tokens.fontSizes),
//   ...extractClasses(tokens.radii),
//   ...extractClasses(tokens.sizeVariants),
//   ...extractClasses(tokens.borderWidths),
//   ...extractClasses(tokens.borderStyles),
//   ...extractClasses(tokens.borderColors),
//   ...extractClasses(tokens.leading),
//   ...extractClasses(tokens.spacingY),
//   ...extractClasses(tokens.shadows),
// ]

// // Optionally add hover variants for colors
// const hoverVariants = safelist
//   .filter((cls) => cls.startsWith('bg-[')) // Only add hover: to background classes
//   .map((cls) => `hover:${cls}`)

// // Final deduplicated list
// const fullSafelist = Array.from(new Set([...safelist, ...hoverVariants]))

// // Save to file
// fs.writeFileSync(
//   path.join(__dirname, '../tailwind.safelist.json'),
//   JSON.stringify(fullSafelist, null, 2)
// )

// console.log(`✅ Safelist generated with ${fullSafelist.length} classes.`)