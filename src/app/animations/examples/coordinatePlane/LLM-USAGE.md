# LLM Usage Guide - Coordinate Plane Drawing

This guide explains how an LLM can easily generate custom coordinate plane visualizations by modifying the configuration section.

## Configuration Structure

The sketch uses a clearly marked configuration block at the top:

```javascript
// ==========================================
// CONFIGURATION - Easily modifiable by LLM
// ==========================================
```

All parameters an LLM needs to modify are within this section.

## Configuration Parameters

### 1. Axis Ranges

```javascript
let xMin = 0; // Start of X-axis
let xMax = 5; // End of X-axis
let yMin = 0; // Start of Y-axis
let yMax = 4000; // End of Y-axis
```

**LLM Decision Points:**

- Choose ranges based on the context/problem domain
- Ensure max > min for each axis
- Consider what values make sense for the scenario

### 2. Grid Spacing

```javascript
let gridScale = 1; // Spacing between X grid lines
let yGridScale = 500; // Spacing between Y grid lines
```

**LLM Decision Points:**

- Grid lines should divide the range into 5-20 intervals
- Calculate: `gridScale = (xMax - xMin) / desiredIntervals`
- Use "nice" numbers (1, 2, 5, 10, 25, 50, 100, etc.)

### 3. Axis Labels

```javascript
let xAxisLabel = "Days";
let yAxisLabel = "Steps";
```

**LLM Decision Points:**

- Use descriptive labels based on the scenario
- Include units when relevant (e.g., "Time (seconds)", "Distance (meters)")

### 4. Initial Data (Optional)

```javascript
let initialPoints = [];
let initialEquations = [];
```

**LLM Decision Points:**

- Use `initialPoints` to show specific coordinate pairs
- Use `initialEquations` to show linear relationships
- Equations use slope-intercept form: y = mx + b

### 5. Pre-drawn Starting Point (Optional)

```javascript
let predrawnStartPoint = null; // or { x: 0, y: 0 }
```

**LLM Decision Points:**

- Set to `null` for free drawing (default)
- Set to a coordinate like `{ x: 0, y: 0 }` to force students to draw from a specific point
- Useful for exercises where all lines must pass through the origin or a specific point
- The point will pulse and show "Start here" label
- After the first line is drawn, students can draw freely

## LLM Generation Patterns

### Pattern 1: From Word Problem

**Input:** "Create a graph showing the relationship between hours studied and test scores. Students who study 0 hours score 50, and each hour of study increases the score by 10 points. Show possible scores up to 5 hours of study."

**LLM Output:**

```javascript
let xMin = 0;
let xMax = 5;
let yMin = 0;
let yMax = 100;
let gridScale = 1;
let yGridScale = 10;
let xAxisLabel = "Hours Studied";
let yAxisLabel = "Test Score";
let initialEquations = [{ slope: 10, intercept: 50, color: [34, 197, 94] }];
```

### Pattern 2: Multiple Scenarios

**Input:** "Compare two phone plans: Plan A costs $30/month with no per-minute charges. Plan B costs $10/month plus $0.50 per minute. Show costs up to 100 minutes."

**LLM Output:**

```javascript
let xMin = 0;
let xMax = 100;
let yMin = 0;
let yMax = 100;
let gridScale = 10;
let yGridScale = 10;
let xAxisLabel = "Minutes Used";
let yAxisLabel = "Monthly Cost ($)";
let initialEquations = [
  { slope: 0, intercept: 30, color: [34, 197, 94] }, // Plan A (flat)
  { slope: 0.5, intercept: 10, color: [59, 130, 246] }, // Plan B (variable)
];
```

### Pattern 3: With Data Points

**Input:** "Show a coordinate plane for tracking plant growth. The plant was 2cm on day 0, 4cm on day 5, and 6cm on day 10."

**LLM Output:**

```javascript
let xMin = 0;
let xMax = 10;
let yMin = 0;
let yMax = 8;
let gridScale = 1;
let yGridScale = 1;
let xAxisLabel = "Days";
let yAxisLabel = "Height (cm)";
let initialPoints = [
  { x: 0, y: 2 },
  { x: 5, y: 4 },
  { x: 10, y: 6 },
];
```

### Pattern 4: Guided Drawing from Origin

**Input:** "Create an exercise where students draw proportional relationships. All lines must start from the origin (0,0)."

**LLM Output:**

```javascript
let xMin = 0;
let xMax = 10;
let yMin = 0;
let yMax = 50;
let gridScale = 1;
let yGridScale = 5;
let xAxisLabel = "X";
let yAxisLabel = "Y";
let predrawnStartPoint = { x: 0, y: 0 };
```

## Color Palette Reference

Provide colors as RGB arrays `[R, G, B]` where each value is 0-255:

```javascript
// Common colors for different lines
let colors = {
  green: [34, 197, 94], // Default, positive growth
  blue: [59, 130, 246], // Alternative, secondary
  red: [239, 68, 68], // Negative, warning
  yellow: [234, 179, 8], // Caution, medium
  purple: [168, 85, 247], // Tertiary option
  orange: [249, 115, 22], // Warm alternative
  gray: [156, 163, 175], // Neutral, reference
};
```

## Validation Rules

When generating configurations, ensure:

1. **Axis ranges are valid:**
   - `xMax > xMin`
   - `yMax > yMin`

2. **Grid spacing is reasonable:**
   - Results in 5-20 grid lines per axis
   - Uses "nice" numbers (powers of 10, multiples of 2 or 5)

3. **Data fits within bounds:**
   - All `initialPoints` have `xMin <= x <= xMax` and `yMin <= y <= yMax`
   - Equations intersect the visible area

4. **Labels are descriptive:**
   - Include units when relevant
   - Use student-friendly language

## Integration Example

For a lesson planning system, the LLM might receive:

```
Topic: Proportional Relationships
Grade Level: 7th grade
Context: Comparing walking speeds
Data: Person A walks 3 mph, Person B walks 4 mph
Duration: Show up to 2 hours
```

And generate:

```javascript
let xMin = 0;
let xMax = 2;
let yMin = 0;
let yMax = 8;
let gridScale = 0.5;
let yGridScale = 1;
let xAxisLabel = "Time (hours)";
let yAxisLabel = "Distance (miles)";
let initialEquations = [
  { slope: 3, intercept: 0, color: [34, 197, 94] }, // Person A
  { slope: 4, intercept: 0, color: [59, 130, 246] }, // Person B
];
```

## Common Use Cases

1. **Rate problems:** Distance vs. Time, Cost vs. Quantity
2. **Growth patterns:** Height vs. Time, Population vs. Year
3. **Comparison scenarios:** Multiple options with different rates
4. **Real-world data:** Plotting measured or collected data points
5. **Prediction exercises:** Show equation, students draw their prediction
6. **Proportional relationships:** Use `predrawnStartPoint` to force lines through origin
7. **Guided exercises:** Use `predrawnStartPoint` to constrain the starting point

## Tips for LLMs

- Always start with understanding the domain (what's being measured?)
- Choose axis ranges that show the "interesting" part of the relationship
- Use colors meaningfully (green for baseline, blue for comparison, etc.)
- Keep grid spacing intuitive for the target grade level
- When in doubt, use ranges that include zero for easier interpretation
