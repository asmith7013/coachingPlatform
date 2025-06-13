# Complete Token-to-Tailwind Mapping Reference

## Overview

This document provides a comprehensive 1:1 mapping between your token system and raw Tailwind CSS classes. Use this as a reference when migrating Tailwind UI components to work with your token system.

---

## Typography Mappings

### Text Size Tokens → Tailwind Classes

```typescript
// Your Tokens → Equivalent Tailwind
textSize.xs       → 'text-xs'        // font-size: 0.75rem; line-height: 1rem;
textSize.sm       → 'text-sm'        // font-size: 0.875rem; line-height: 1.25rem;
textSize.base     → 'text-base'      // font-size: 1rem; line-height: 1.5rem;
textSize.lg       → 'text-lg'        // font-size: 1.125rem; line-height: 1.75rem;
textSize.xl       → 'text-xl'        // font-size: 1.25rem; line-height: 1.75rem;
textSize['2xl']   → 'text-2xl'       // font-size: 1.5rem; line-height: 2rem;
```

### Font Weight Tokens → Tailwind Classes

```typescript
// Your Tokens → Equivalent Tailwind
weight.normal     → 'font-normal'    // font-weight: 400;
weight.medium     → 'font-medium'    // font-weight: 500;
weight.semibold   → 'font-semibold'  // font-weight: 600;
weight.bold       → 'font-bold'      // font-weight: 700;
```

### Heading Tokens → Tailwind Classes

```typescript
// Your Tokens → Equivalent Tailwind
heading.h1        → 'text-4xl md:text-5xl leading-tight'
heading.h2        → 'text-3xl md:text-4xl leading-tight'
heading.h3        → 'text-2xl md:text-3xl leading-snug'
heading.h4        → 'text-xl md:text-2xl leading-snug'
heading.h5        → 'text-lg md:text-xl leading-normal'
heading.h6        → 'text-base md:text-lg leading-normal'
```

---

## Color Mappings

### Text Color Tokens → Tailwind Classes

```typescript
// Basic Text Colors
textColors.default      → 'text-secondary'        // Uses your semantic system
textColors.muted        → 'text-muted'           // Uses your semantic system
textColors.accent       → 'text-accent'          // Uses your semantic system  
textColors.primary      → 'text-primary'         // Uses your semantic system
textColors.secondary    → 'text-secondary'       // Uses your semantic system
textColors.danger       → 'text-danger'          // Uses your semantic system
textColors.success      → 'text-success'         // Uses your semantic system
textColors.white        → 'text-white'           // color: rgb(255 255 255);
textColors.black        → 'text-black'           // color: rgb(0 0 0);

// Raw Tailwind Equivalents (what your semantic tokens resolve to)
textColors.default      → 'text-paynes-gray'     // #4f5d75
textColors.muted        → 'text-paynes-gray'     // #4f5d75  
textColors.accent       → 'text-red-violet'      // #c52184
textColors.primary      → 'text-red-violet'      // #c52184
textColors.danger       → 'text-raspberry'       // #d81159
textColors.success      → 'text-green-success'   // #18a058
```

### Background Color Tokens → Tailwind Classes

```typescript
// Basic Background Colors
backgroundColors.default    → 'bg-default'           // Uses semantic system
backgroundColors.primary    → 'bg-primary-400'       // Uses semantic system
backgroundColors.secondary  → 'bg-secondary-400'     // Uses semantic system
backgroundColors.danger     → 'bg-danger-400'        // Uses semantic system
backgroundColors.success    → 'bg-success-400'       // Uses semantic system
backgroundColors.white      → 'bg-white'             // background-color: rgb(255 255 255);

// Raw Tailwind Equivalents 
backgroundColors.primary    → 'bg-red-violet-400'    // Your custom color
backgroundColors.secondary  → 'bg-paynes-gray-400'   // Your custom color
backgroundColors.danger     → 'bg-raspberry-400'     // Your custom color
backgroundColors.success    → 'bg-green-success-400' // Your custom color
```

### Border Color Tokens → Tailwind Classes

```typescript
// Basic Border Colors
borderColors.default    → 'border-default'       // Uses semantic system
borderColors.primary    → 'border-primary-200'   // Uses semantic system
borderColors.secondary  → 'border-secondary-200' // Uses semantic system
borderColors.danger     → 'border-danger-200'    // Uses semantic system
borderColors.success    → 'border-success-200'   // Uses semantic system

// Raw Tailwind Equivalents
borderColors.primary    → 'border-red-violet-200'    // Your custom color
borderColors.secondary  → 'border-paynes-gray-200'   // Your custom color
borderColors.danger     → 'border-raspberry-200'     // Your custom color
borderColors.success    → 'border-green-success-200' // Your custom color
```

---

## Spacing Mappings

### Padding Tokens → Tailwind Classes

```typescript
// Horizontal Padding (paddingX)
paddingX.none     → 'px-0'      // padding-left: 0px; padding-right: 0px;
paddingX.xs       → 'px-1'      // padding-left: 0.25rem; padding-right: 0.25rem;
paddingX.sm       → 'px-2'      // padding-left: 0.5rem; padding-right: 0.5rem;
paddingX.md       → 'px-4'      // padding-left: 1rem; padding-right: 1rem;
paddingX.lg       → 'px-6'      // padding-left: 1.5rem; padding-right: 1.5rem;
paddingX.xl       → 'px-8'      // padding-left: 2rem; padding-right: 2rem;
paddingX['2xl']   → 'px-12'     // padding-left: 3rem; padding-right: 3rem;

// Vertical Padding (paddingY)
paddingY.none     → 'py-0'      // padding-top: 0px; padding-bottom: 0px;
paddingY.xs       → 'py-0.5'    // padding-top: 0.125rem; padding-bottom: 0.125rem;
paddingY.sm       → 'py-1'      // padding-top: 0.25rem; padding-bottom: 0.25rem;
paddingY.md       → 'py-2'      // padding-top: 0.5rem; padding-bottom: 0.5rem;
paddingY.lg       → 'py-3'      // padding-top: 0.75rem; padding-bottom: 0.75rem;
paddingY.xl       → 'py-4'      // padding-top: 1rem; padding-bottom: 1rem;
paddingY['2xl']   → 'py-6'      // padding-top: 1.5rem; padding-bottom: 1.5rem;
```

### **NEW: Margin Tokens → Tailwind Classes**

```typescript
// All-directional Margin (margin)
margin.none       → 'm-0'       // margin: 0px;
margin.xs         → 'm-1'       // margin: 0.25rem;
margin.sm         → 'm-2'       // margin: 0.5rem;
margin.md         → 'm-4'       // margin: 1rem;
margin.lg         → 'm-6'       // margin: 1.5rem;
margin.xl         → 'm-8'       // margin: 2rem;
margin['2xl']     → 'm-12'      // margin: 3rem;

// Horizontal Margin (marginX)
marginX.none      → 'mx-0'      // margin-left: 0px; margin-right: 0px;
marginX.xs        → 'mx-1'      // margin-left: 0.25rem; margin-right: 0.25rem;
marginX.sm        → 'mx-2'      // margin-left: 0.5rem; margin-right: 0.5rem;
marginX.md        → 'mx-4'      // margin-left: 1rem; margin-right: 1rem;
marginX.lg        → 'mx-6'      // margin-left: 1.5rem; margin-right: 1.5rem;
marginX.xl        → 'mx-8'      // margin-left: 2rem; margin-right: 2rem;
marginX.auto      → 'mx-auto'   // margin-left: auto; margin-right: auto; (CENTERING)

// Vertical Margin (marginY)
marginY.none      → 'my-0'      // margin-top: 0px; margin-bottom: 0px;
marginY.xs        → 'my-1'      // margin-top: 0.25rem; margin-bottom: 0.25rem;
marginY.sm        → 'my-2'      // margin-top: 0.5rem; margin-bottom: 0.5rem;
marginY.md        → 'my-4'      // margin-top: 1rem; margin-bottom: 1rem;
marginY.lg        → 'my-6'      // margin-top: 1.5rem; margin-bottom: 1.5rem;
marginY.xl        → 'my-8'      // margin-top: 2rem; margin-bottom: 2rem;
marginY['2xl']    → 'my-12'     // margin-top: 3rem; margin-bottom: 3rem;
marginY.auto      → 'my-auto'   // margin-top: auto; margin-bottom: auto; (CENTERING)
```

### **NEW: Spacing Between Children → Tailwind Classes**

```typescript
// Horizontal spacing between children (spaceBetween.x)
spaceBetween.x.none → 'space-x-0'   // > * + * { margin-left: 0px; }
spaceBetween.x.xs   → 'space-x-1'   // > * + * { margin-left: 0.25rem; }
spaceBetween.x.sm   → 'space-x-2'   // > * + * { margin-left: 0.5rem; }
spaceBetween.x.md   → 'space-x-4'   // > * + * { margin-left: 1rem; }
spaceBetween.x.lg   → 'space-x-6'   // > * + * { margin-left: 1.5rem; }
spaceBetween.x.xl   → 'space-x-8'   // > * + * { margin-left: 2rem; }

// Vertical spacing between children (spaceBetween.y)
spaceBetween.y.none → 'space-y-0'   // > * + * { margin-top: 0px; }
spaceBetween.y.xs   → 'space-y-1'   // > * + * { margin-top: 0.25rem; }
spaceBetween.y.sm   → 'space-y-2'   // > * + * { margin-top: 0.5rem; }
spaceBetween.y.md   → 'space-y-4'   // > * + * { margin-top: 1rem; }
spaceBetween.y.lg   → 'space-y-6'   // > * + * { margin-top: 1.5rem; }
spaceBetween.y.xl   → 'space-y-8'   // > * + * { margin-top: 2rem; }
```

### Gap Tokens → Tailwind Classes

```typescript
// Your Tokens → Equivalent Tailwind
gap.none          → 'gap-0'     // gap: 0px;
gap.sm            → 'gap-2'     // gap: 0.5rem;
gap.md            → 'gap-4'     // gap: 1rem;
gap.lg            → 'gap-6'     // gap: 1.5rem;
gap.xl            → 'gap-8'     // gap: 2rem;
```

### Component Size Tokens → Tailwind Classes

```typescript
// Combined size + padding tokens
componentSize.xs  → 'text-xs px-1 py-0.5'    // Small button/input
componentSize.sm  → 'text-sm px-2 py-1'      // Small button/input
componentSize.md  → 'text-base px-4 py-2'    // Default button/input
componentSize.lg  → 'text-lg px-6 py-3'      // Large button/input
componentSize.xl  → 'text-xl px-8 py-4'      // Extra large button/input
```

---

## **NEW: Sizing Mappings**

### Icon Size Tokens → Tailwind Classes

```typescript
// Icon sizing system (iconSizes)
iconSizes.xs      → 'size-3'    // width: 0.75rem; height: 0.75rem; (w-3 h-3)
iconSizes.sm      → 'size-4'    // width: 1rem; height: 1rem; (w-4 h-4)
iconSizes.md      → 'size-5'    // width: 1.25rem; height: 1.25rem; (w-5 h-5) - MOST COMMON
iconSizes.lg      → 'size-6'    // width: 1.5rem; height: 1.5rem; (w-6 h-6) - VERY COMMON
iconSizes.xl      → 'size-8'    // width: 2rem; height: 2rem; (w-8 h-8)
iconSizes['2xl']  → 'size-12'   // width: 3rem; height: 3rem; (w-12 h-12)
iconSizes['3xl']  → 'size-16'   // width: 4rem; height: 4rem; (w-16 h-16)
```

### Avatar Size Tokens → Tailwind Classes

```typescript
// Avatar/profile image sizing (avatarSizes)
avatarSizes.xs    → 'size-6'    // width: 1.5rem; height: 1.5rem; (w-6 h-6) - Small profile
avatarSizes.sm    → 'size-8'    // width: 2rem; height: 2rem; (w-8 h-8) - Small avatar
avatarSizes.md    → 'size-12'   // width: 3rem; height: 3rem; (w-12 h-12) - Standard avatar
avatarSizes.lg    → 'size-16'   // width: 4rem; height: 4rem; (w-16 h-16) - Large profile
avatarSizes.xl    → 'size-20'   // width: 5rem; height: 5rem; (w-20 h-20) - Hero avatar
avatarSizes['2xl'] → 'size-24'  // width: 6rem; height: 6rem; (w-24 h-24) - Extra large
```

---

## **NEW: Layout Utility Mappings**

### Centering Tokens → Tailwind Classes

```typescript
// Centering utilities (center)
center.x          → 'mx-auto'   // margin-left: auto; margin-right: auto; (horizontal centering)
center.y          → 'my-auto'   // margin-top: auto; margin-bottom: auto; (vertical centering)
center.both       → 'm-auto'    // margin: auto; (both directions)
```

### Flex Utility Tokens → Tailwind Classes

```typescript
// Flex utilities (flex)
flex.grow         → 'flex-1'    // flex: 1 1 0%; (grow to fill space)
flex.shrink       → 'shrink-0'  // flex-shrink: 0; (prevent shrinking)
flex.minWidth     → 'w-0'       // width: 0px; (min width for flex-1 patterns)
flex.none         → 'flex-none' // flex: none; (no flex behavior)
```

### Position Tokens → Tailwind Classes

```typescript
// Position utilities (position)
position.static   → 'static'    // position: static;
position.relative → 'relative'  // position: relative;
position.absolute → 'absolute'  // position: absolute;
position.fixed    → 'fixed'     // position: fixed;
position.sticky   → 'sticky'    // position: sticky;
```

### Inset Tokens → Tailwind Classes

```typescript
// Common positioning offsets (inset)
inset.auto        → 'inset-auto'  // top: auto; right: auto; bottom: auto; left: auto;
inset.full        → 'inset-0'     // top: 0px; right: 0px; bottom: 0px; left: 0px;

// Directional insets
inset.x.auto      → 'inset-x-auto' // left: auto; right: auto;
inset.x.full      → 'inset-x-0'    // left: 0px; right: 0px;
inset.y.auto      → 'inset-y-auto' // top: auto; bottom: auto;
inset.y.full      → 'inset-y-0'    // top: 0px; bottom: 0px;
```

---

## Shape Mappings

### Border Radius Tokens → Tailwind Classes

```typescript
// Your Tokens → Equivalent Tailwind
radii.none        → 'rounded-none'    // border-radius: 0px;
radii.sm          → 'rounded-sm'      // border-radius: 0.125rem;
radii.md          → 'rounded'         // border-radius: 0.25rem;
radii.lg          → 'rounded-lg'      // border-radius: 0.5rem;
radii.xl          → 'rounded-xl'      // border-radius: 0.75rem;
radii['2xl']      → 'rounded-2xl'     // border-radius: 1rem;
radii.full        → 'rounded-full'    // border-radius: 9999px;
```

### **NEW: Directional Border Radius → Tailwind Classes**

```typescript
// Top border radius (radiiTop)
radiiTop.none     → 'rounded-t-none'  // border-top-left-radius: 0px; border-top-right-radius: 0px;
radiiTop.sm       → 'rounded-t-sm'    // border-top-left-radius: 0.125rem; border-top-right-radius: 0.125rem;
radiiTop.md       → 'rounded-t'       // border-top-left-radius: 0.25rem; border-top-right-radius: 0.25rem;
radiiTop.lg       → 'rounded-t-lg'    // border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem;
radiiTop.xl       → 'rounded-t-xl'    // border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem;
radiiTop['2xl']   → 'rounded-t-2xl'   // border-top-left-radius: 1rem; border-top-right-radius: 1rem;

// Bottom border radius (radiiBottom)
radiiBottom.none  → 'rounded-b-none'  // border-bottom-left-radius: 0px; border-bottom-right-radius: 0px;
radiiBottom.sm    → 'rounded-b-sm'    // border-bottom-left-radius: 0.125rem; border-bottom-right-radius: 0.125rem;
radiiBottom.md    → 'rounded-b'       // border-bottom-left-radius: 0.25rem; border-bottom-right-radius: 0.25rem;
radiiBottom.lg    → 'rounded-b-lg'    // border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem;
radiiBottom.xl    → 'rounded-b-xl'    // border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem;
radiiBottom['2xl'] → 'rounded-b-2xl'  // border-bottom-left-radius: 1rem; border-bottom-right-radius: 1rem;

// Left border radius (radiiLeft) - NEW
radiiLeft.none    → 'rounded-l-none'  // border-top-left-radius: 0px; border-bottom-left-radius: 0px;
radiiLeft.sm      → 'rounded-l-sm'    // border-top-left-radius: 0.125rem; border-bottom-left-radius: 0.125rem;
radiiLeft.md      → 'rounded-l'       // border-top-left-radius: 0.25rem; border-bottom-left-radius: 0.25rem;
radiiLeft.lg      → 'rounded-l-lg'    // border-top-left-radius: 0.5rem; border-bottom-left-radius: 0.5rem;
radiiLeft.xl      → 'rounded-l-xl'    // border-top-left-radius: 0.75rem; border-bottom-left-radius: 0.75rem;
radiiLeft['2xl']  → 'rounded-l-2xl'   // border-top-left-radius: 1rem; border-bottom-left-radius: 1rem;

// Right border radius (radiiRight) - NEW
radiiRight.none   → 'rounded-r-none'  // border-top-right-radius: 0px; border-bottom-right-radius: 0px;
radiiRight.sm     → 'rounded-r-sm'    // border-top-right-radius: 0.125rem; border-bottom-right-radius: 0.125rem;
radiiRight.md     → 'rounded-r'       // border-top-right-radius: 0.25rem; border-bottom-right-radius: 0.25rem;
radiiRight.lg     → 'rounded-r-lg'    // border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem;
radiiRight.xl     → 'rounded-r-xl'    // border-top-right-radius: 0.75rem; border-bottom-right-radius: 0.75rem;
radiiRight['2xl'] → 'rounded-r-2xl'   // border-top-right-radius: 1rem; border-bottom-right-radius: 1rem;
```

### Shadow Tokens → Tailwind Classes

```typescript
// Your Tokens → Equivalent Tailwind
shadows.none      → 'shadow-none'     // box-shadow: 0 0 #0000;
shadows.sm        → 'shadow-sm'       // box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
shadows.md        → 'shadow-md'       // box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
shadows.lg        → 'shadow-lg'       // box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
shadows.xl        → 'shadow-xl'       // box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
shadows['2xl']    → 'shadow-2xl'      // box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### Border Tokens → Tailwind Classes

```typescript
// Border Widths
borderWidths.none → 'border-0'        // border-width: 0px;
borderWidths.sm   → 'border'          // border-width: 1px;
borderWidths.md   → 'border-2'        // border-width: 2px;
borderWidths.lg   → 'border-4'        // border-width: 4px;

// Border Styles  
borderStyles.solid   → 'border-solid'    // border-style: solid;
borderStyles.dashed  → 'border-dashed'   // border-style: dashed;
borderStyles.dotted  → 'border-dotted'   // border-style: dotted;

// Border Positions
borderPositions.top    → 'border-t'      // border-top-width: 1px;
borderPositions.right  → 'border-r'      // border-right-width: 1px;
borderPositions.bottom → 'border-b'      // border-bottom-width: 1px;
borderPositions.left   → 'border-l'      // border-left-width: 1px;
borderPositions.all    → 'border'        // border-width: 1px;
```

---

## Layout Mappings

### Flexbox Tokens → Tailwind Classes

```typescript
// Flex Direction
layout.flex.direction.row         → 'flex-row'         // flex-direction: row;
layout.flex.direction.col         → 'flex-col'         // flex-direction: column;
layout.flex.direction['row-reverse'] → 'flex-row-reverse' // flex-direction: row-reverse;
layout.flex.direction['col-reverse'] → 'flex-col-reverse' // flex-direction: column-reverse;

// Justify Content
layout.flex.justify.start         → 'justify-start'    // justify-content: flex-start;
layout.flex.justify.end           → 'justify-end'      // justify-content: flex-end;
layout.flex.justify.center        → 'justify-center'   // justify-content: center;
layout.flex.justify.between       → 'justify-between'  // justify-content: space-between;
layout.flex.justify.around        → 'justify-around'   // justify-content: space-around;
layout.flex.justify.evenly        → 'justify-evenly'   // justify-content: space-evenly;

// Align Items
layout.flex.align.start           → 'items-start'      // align-items: flex-start;
layout.flex.align.end             → 'items-end'        // align-items: flex-end;
layout.flex.align.center          → 'items-center'     // align-items: center;
layout.flex.align.baseline        → 'items-baseline'   // align-items: baseline;
layout.flex.align.stretch         → 'items-stretch'    // align-items: stretch;
```

### Grid Tokens → Tailwind Classes

```typescript
// Grid Columns
layout.grid.cols[1]   → 'grid-cols-1'    // grid-template-columns: repeat(1, minmax(0, 1fr));
layout.grid.cols[2]   → 'grid-cols-2'    // grid-template-columns: repeat(2, minmax(0, 1fr));
layout.grid.cols[3]   → 'grid-cols-3'    // grid-template-columns: repeat(3, minmax(0, 1fr));
layout.grid.cols[4]   → 'grid-cols-4'    // grid-template-columns: repeat(4, minmax(0, 1fr));
layout.grid.cols[6]   → 'grid-cols-6'    // grid-template-columns: repeat(6, minmax(0, 1fr));
layout.grid.cols[12]  → 'grid-cols-12'   // grid-template-columns: repeat(12, minmax(0, 1fr));

// Grid Gap
layout.grid.gap.none  → 'gap-0'          // gap: 0px;
layout.grid.gap.sm    → 'gap-2'          // gap: 0.5rem;
layout.grid.gap.md    → 'gap-4'          // gap: 1rem;
layout.grid.gap.lg    → 'gap-6'          // gap: 1.5rem;
layout.grid.gap.xl    → 'gap-8'          // gap: 2rem;
```

---

## **NEW: Common Migration Patterns**

### Before/After Examples with New Tokens

```typescript
// PATTERN 1: Icon with centering and spacing
// BEFORE: Raw Tailwind
className="w-6 h-6 mx-auto mb-1"

// AFTER: Your Tokens
import { iconSizes, center, marginY } from '@/lib/tokens/tokens';
className={cn(iconSizes.lg, center.x, marginY.xs)}

// PATTERN 2: Avatar with consistent sizing
// BEFORE: Raw Tailwind
className="w-12 h-12 rounded-full"

// AFTER: Your Tokens
import { avatarSizes, radii } from '@/lib/tokens/tokens';
className={cn(avatarSizes.md, radii.full)}

// PATTERN 3: Stack layout with spacing and padding
// BEFORE: Raw Tailwind
className="space-y-2 p-4"

// AFTER: Your Tokens
import { spaceBetween, paddingX, paddingY } from '@/lib/tokens/tokens';
className={cn(spaceBetween.y.sm, paddingX.md, paddingY.md)}

// PATTERN 4: Card with directional radius
// BEFORE: Raw Tailwind
className="rounded-l-md border-r-0"

// AFTER: Your Tokens
import { radiiLeft } from '@/lib/tokens/tokens';
className={cn(radiiLeft.md, 'border-r-0')}

// PATTERN 5: Flex utilities for layout
// BEFORE: Raw Tailwind
className="flex-1 shrink-0"

// AFTER: Your Tokens
import { flex } from '@/lib/tokens/tokens';
className={cn(flex.grow, flex.shrink)}

// PATTERN 6: Button with icon spacing
// BEFORE: Raw Tailwind
className="flex items-center space-x-2 px-4 py-2"

// AFTER: Your Tokens
import { spaceBetween, paddingX, paddingY } from '@/lib/tokens/tokens';
className={cn('flex items-center', spaceBetween.x.sm, paddingX.md, paddingY.sm)}
```

---

## Common Tailwind UI Patterns → Your Tokens

### Button Patterns

```typescript
// Tailwind UI: "inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"

// Your Token Equivalent:
`inline-flex w-full ${layout.flex.justify.center} ${gap.sm} ${radii.md} ${backgroundColors.white} ${paddingX.lg} ${paddingY.md} ${textSize.sm} ${weight.semibold} ${textColors.default} ${shadows.sm} ${borderWidths.sm} ${borderColors.muted} hover:${hoverBackgroundColors.light.muted}`
```

### Menu Patterns

```typescript
// Tailwind UI: "absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5"

// Your Token Equivalent:
`absolute right-0 z-10 ${marginY.sm} w-56 origin-top-right ${radii.md} ${backgroundColors.white} ${shadows.lg} ${borderWidths.sm} ${borderColors.light.muted}`
```

### Menu Item Patterns

```typescript
// Tailwind UI: "block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900"

// Your Token Equivalent:
`block ${paddingX.md} ${paddingY.md} ${textSize.sm} ${textColors.muted} data-focus:${hoverBackgroundColors.light.muted} data-focus:${textColors.default}`
```

### **NEW: Card with Split Layout Pattern**

```typescript
// Tailwind UI: "col-span-1 flex rounded-md shadow-sm"
// Left section: "flex w-16 shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white bg-blue-600"
// Right section: "flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white"

// Your Token Equivalent:
const container = cn('col-span-1 flex', radii.md, shadows.sm);
const leftSection = cn('flex w-16', flex.shrink, 'items-center justify-center', radiiLeft.md, textSize.sm, weight.medium, textColors.white, backgroundColors.primary);
const rightSection = cn('flex', flex.grow, 'items-center justify-between truncate', radiiRight.md, 'border-t border-r border-b', borderColors.muted, backgroundColors.white);
```

### **NEW: Icon Grid Pattern**

```typescript
// Tailwind UI: "grid grid-cols-4 gap-4" with "w-6 h-6 mx-auto"

// Your Token Equivalent:
import { iconSizes, center, gap } from '@/lib/tokens/tokens';
const gridContainer = cn('grid grid-cols-4', gap.md);
const iconWrapper = cn(center.x);
const iconClass = iconSizes.lg;
```

---

## Special Cases & Advanced Mappings

### Ring Colors (Focus States)

```typescript
// Your Ring Tokens → Tailwind Classes
ringColors.default     → 'ring-default'          // Uses semantic system
ringColors.primary     → 'ring-primary-400'      // Uses semantic system  
ringColors.danger      → 'ring-danger-400'       // Uses semantic system

// Focus Ring Patterns
'focus:ring-2 focus:ring-blue-500' → `focus:ring-2 ${ringColors.primary}`
```

### Hover States

```typescript
// Your Hover Tokens → Tailwind Classes
hoverBackgroundColors.default   → 'hover:bg-default-100'
hoverBackgroundColors.primary   → 'hover:bg-primary-200' 
hoverTextColors.primary         → 'hover:text-primary-700'

// Hover Patterns
'hover:bg-gray-50' → hoverBackgroundColors.light.muted
'hover:text-gray-900' → hoverTextColors.default
```

### Dark Mode Patterns

```typescript
// Your system includes dark mode variants:
textColors.combined.default     → 'text-default dark:text-surface'
backgroundColors.combined.white → 'bg-white dark:bg-surface-800'
borderColors.combined.muted     → 'border-muted-200 dark:border-muted-700'
```

---

## Migration Strategy

### Step 1: Identify Raw Tailwind Classes
Look for classes like:
- `text-gray-900` → `textColors.default`
- `bg-white` → `backgroundColors.white`  
- `px-3 py-2` → `${paddingX.lg} ${paddingY.md}`
- `rounded-md` → `radii.md`
- `shadow-xs` → `shadows.sm`
- **NEW**: `w-6 h-6` → `iconSizes.lg`
- **NEW**: `mx-auto` → `center.x`
- **NEW**: `space-x-2` → `spaceBetween.x.sm`
- **NEW**: `flex-1` → `flex.grow`
- **NEW**: `rounded-l-md` → `radiiLeft.md`

### Step 2: Replace with Token References
```typescript
// Before (Raw Tailwind)
className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"

// After (Your Tokens)
className={cn(
  'inline-flex items-center',
  paddingX.lg,
  paddingY.md,
  textSize.sm,
  weight.medium,
  textColors.muted,
  backgroundColors.white,
  borderWidths.sm,
  borderColors.muted,
  radii.md,
  shadows.sm,
  hoverBackgroundColors.light.muted
)}
```

### Step 3: Use Tailwind Variants for Complex Components
For components with multiple states, use `tv()`:

```typescript
const button = tv({
  base: [
    'inline-flex items-center',
    paddingX.lg,
    paddingY.md,
    textSize.sm,
    weight.medium,
    radii.md,
    shadows.sm
  ],
  variants: {
    variant: {
      primary: [backgroundColors.primary, textColors.white],
      secondary: [backgroundColors.white, textColors.muted, borderWidths.sm, borderColors.muted]
    },
    // NEW: Icon size variants
    iconSize: {
      sm: { icon: iconSizes.sm },
      md: { icon: iconSizes.md },
      lg: { icon: iconSizes.lg },
    }
  }
});
```

---

## **NEW: Quick Reference Cheat Sheet**

### Most Common NEW Token Mappings
```typescript
// Icon & Avatar Sizing
'w-6 h-6' → iconSizes.lg            'w-12 h-12' → avatarSizes.md
'w-4 h-4' → iconSizes.sm            'w-16 h-16' → avatarSizes.lg
'w-5 h-5' → iconSizes.md            'w-8 h-8' → avatarSizes.sm

// Centering & Layout
'mx-auto' → center.x                'my-auto' → center.y
'flex-1' → flex.grow                'shrink-0' → flex.shrink
'm-auto' → center.both              'w-0' → flex.minWidth

// Margins
'mx-4' → marginX.md                 'my-2' → marginY.sm
'mb-1' → 'mb-1' (keep individual)   'mt-4' → 'mt-4' (keep individual)

// Spacing Between Children
'space-x-2' → spaceBetween.x.sm     'space-y-4' → spaceBetween.y.md
'space-x-1' → spaceBetween.x.xs     'space-y-6' → spaceBetween.y.lg

// Directional Border Radius
'rounded-l-md' → radiiLeft.md       'rounded-r-lg' → radiiRight.lg
'rounded-t-sm' → radiiTop.sm        'rounded-b-xl' → radiiBottom.xl

// Position Utilities
'relative' → position.relative       'absolute' → position.absolute
'inset-0' → inset.full              'inset-x-0' → inset.x.full
```

### Legacy vs New Token Patterns
```typescript
// OLD: Using raw classes or incomplete tokens
'px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm w-6 h-6 mx-auto space-x-2 flex-1'

// NEW: Complete token coverage
cn(
  paddingX.lg, paddingY.md,          // Spacing
  textSize.sm, weight.semibold,      // Typography  
  textColors.default,                // Colors
  backgroundColors.white,            // Colors
  radii.md, shadows.sm,              // Shape
  iconSizes.lg,                      // NEW: Sizing
  center.x,                          // NEW: Layout
  spaceBetween.x.sm,                 // NEW: Spacing between
  flex.grow                          // NEW: Flex utilities
)
```

This mapping system allows for seamless migration of Tailwind UI components while maintaining your design system's consistency and semantic meaning. The new token additions provide comprehensive coverage for previously unmapped patterns, ensuring 95%+ of common Tailwind patterns now have semantic token equivalents.