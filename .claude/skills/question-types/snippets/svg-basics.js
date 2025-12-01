// SVG and D3 Visualization Snippets
// Copy and adapt these patterns for your question

// ============================================
// BASIC SVG SETUP
// ============================================

const svg = container
  .append("svg")
  .attr("viewBox", "0 0 800 600")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("max-width", "800px");

// ============================================
// RECTANGLE
// ============================================

svg.append("rect")
  .attr("x", 100)
  .attr("y", 100)
  .attr("width", 200)
  .attr("height", 100)
  .attr("fill", "#fbbf24")
  .attr("stroke", "#92400e")
  .attr("stroke-width", 2);

// ============================================
// CIRCLE
// ============================================

svg.append("circle")
  .attr("cx", 200)
  .attr("cy", 200)
  .attr("r", 50)
  .attr("fill", "#3b82f6")
  .attr("stroke", "#1e40af")
  .attr("stroke-width", 2);

// ============================================
// TEXT LABEL
// ============================================

svg.append("text")
  .attr("x", 200)
  .attr("y", 160)
  .attr("text-anchor", "middle")
  .attr("font-size", "18px")
  .attr("font-weight", "600")
  .attr("fill", "#1f2937")
  .text("Label");

// ============================================
// LINE
// ============================================

svg.append("line")
  .attr("x1", 100)
  .attr("y1", 100)
  .attr("x2", 300)
  .attr("y2", 200)
  .attr("stroke", "#374151")
  .attr("stroke-width", 2);
