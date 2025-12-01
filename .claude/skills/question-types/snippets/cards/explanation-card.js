// Explanation Card Component
// Copy this function into your chart.js IIFE

/**
 * Explanation Card Component
 * Creates a standardized "Explain your thinking" card with textarea.
 */
function createExplanationCard(d3, container, options) {
  options = options || {};

  const prompt = options.prompt || "Explain your thinking:";
  const placeholder = options.placeholder || "Type your explanation here...";
  const rows = options.rows || 4;
  const onInput = options.onInput || function () {};
  const marginTop = options.marginTop || "24px";

  // Explanation card
  const explanationCard = container
    .append("div")
    .attr("class", "explanation-card")
    .style("background", "#ffffff")
    .style("border", "1px solid #e5e7eb")
    .style("border-radius", "16px")
    .style("padding", "20px")
    .style("box-shadow", "0 6px 16px rgba(15,23,42,0.05)")
    .style("margin-top", marginTop);

  // Prompt inside the card
  explanationCard
    .append("div")
    .attr("class", "explanation-prompt")
    .style("font-size", "16px")
    .style("font-weight", "600")
    .style("margin-bottom", "12px")
    .text(prompt);

  // Textarea
  const textarea = explanationCard
    .append("textarea")
    .attr("rows", rows)
    .style("width", "100%")
    .style("box-sizing", "border-box")
    .style("border", "1px solid #cbd5e1")
    .style("border-radius", "12px")
    .style("padding", "12px 14px")
    .style("font-size", "16px")
    .style("line-height", "1.5")
    .style("resize", "vertical")
    .style(
      "font-family",
      "'Inter', system-ui, -apple-system, BlinkMacSystemFont"
    )
    .attr("placeholder", placeholder)
    .on("input", function () {
      onInput(this.value);
    });

  return textarea;
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Basic usage:
createExplanationCard(d3, content, {
  onInput: (value) => {
    chartState.explanation = value;
    sendChartState();
  }
});

// With custom options:
createExplanationCard(d3, content, {
  prompt: "Explain your thinking:",
  placeholder: "How did you solve this problem?",
  rows: 4,
  marginTop: "24px",
  onInput: (value) => {
    chartState.explanation = value;
    sendChartState();
  }
});
