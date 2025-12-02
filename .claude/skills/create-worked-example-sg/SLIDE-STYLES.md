# Slide Styling Guide

This document provides basic styling patterns for HTML slides based on the example slide decks.

## Core Principles

1. **Dark backgrounds** with gradient effects
2. **High contrast text** (white/light text on dark backgrounds)
3. **Accent colors** for emphasis (purple, yellow, green, blue, red)
4. **Large, bold typography** for headings
5. **Rounded corners** and soft edges on content boxes
6. **Generous padding** and spacing

## Basic Slide Structure

```html
<div class="slide-container" style="
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: #ffffff;
  font-family: system-ui, -apple-system, sans-serif;
">
  <!-- Slide content -->
</div>
```

## Common Patterns

### Title Slide
- Large heading (3-4rem font size)
- Centered content
- Optional badge/label at top
- Subtitle text (1.5-2rem)

### Problem/Content Slide
- Heading at top (2-3rem)
- Content boxes with rounded borders
- Description text (1.25rem)

### CFU (Check for Understanding) Question
- Position at bottom of slide
- Yellow/orange accent color
- Icon (❓) + question text
- Border-left accent line

### Answer/Reveal
- Position at bottom of slide
- Green accent color
- Same layout as CFU

### Content Boxes
- Semi-transparent background
- 2px colored border
- Rounded corners (1-1.5rem)
- Padding (2-3rem)

## Example Code Snippets

**Title Slide:**
```html
<h1 style="font-size: 3.75rem; font-weight: 800; color: #d946ef; text-transform: uppercase;">
  BALANCING THE EQUATION
</h1>
```

**CFU Box:**
```html
<div style="background: rgba(245, 158, 11, 0.15); border-left: 4px solid #fbbf24; padding: 1.5rem 2rem; border-radius: 0.75rem;">
  <span style="font-size: 1.5rem;">❓</span>
  <span style="color: #fbbf24; font-size: 1.25rem;">Check for Understanding: Why did I...</span>
</div>
```

**Content Box:**
```html
<div style="background: rgba(42, 42, 62, 0.6); border: 2px solid #60a5fa; border-radius: 1.5rem; padding: 2.5rem;">
  <!-- Content -->
</div>
```

## Notes

- Colors can vary based on the problem context
- Use inline styles or embedded `<style>` tags
- Keep styles simple and readable
- Focus on visual clarity and hierarchy
