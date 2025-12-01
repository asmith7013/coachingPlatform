// Form Input Snippets
// Copy and adapt these patterns for your question

// ============================================
// EXPLANATION CARD (COMPONENT)
// ============================================

createExplanationCard(d3, content, {
  prompt: "Explain your thinking:",
  placeholder: "How did you solve this?",
  rows: 4,
  marginTop: "24px",
  onInput: (value) => {
    chartState.explanation = value;
    sendChartState();
  }
});

// ============================================
// CUSTOM TEXTAREA
// ============================================

const textarea = container
  .append("textarea")
  .attr("rows", 4)
  .style("width", "100%")
  .style("padding", "12px")
  .style("border", "1px solid #cbd5e1")
  .style("border-radius", "8px")
  .style("font-size", "16px")
  .style("font-family", "inherit")
  .style("resize", "vertical")
  .property("value", chartState.answer)
  .attr("disabled", interactivityLocked ? true : null)
  .on("input", function() {
    if (!interactivityLocked) {
      chartState.answer = this.value;
      sendChartState();
    }
  });

// ============================================
// TEXT INPUT
// ============================================

const input = container
  .append("input")
  .attr("type", "text")
  .attr("inputmode", "numeric") // or "text"
  .style("width", "80px")
  .style("padding", "8px")
  .style("border", "1px solid #cbd5e1")
  .style("border-radius", "6px")
  .style("text-align", "center")
  .property("value", chartState.value)
  .attr("disabled", interactivityLocked ? true : null)
  .on("input", function() {
    if (!interactivityLocked) {
      chartState.value = this.value;
      sendChartState();
    }
  });

// ============================================
// +/- BUTTON
// ============================================

const button = container
  .append("button")
  .attr("type", "button")
  .style("width", "32px")
  .style("height", "32px")
  .style("border", "1px solid #d1d5db")
  .style("background", "#fff")
  .style("border-radius", "6px")
  .style("cursor", interactivityLocked ? "not-allowed" : "pointer")
  .style("font-size", "18px")
  .text("+")
  .on("click", () => {
    if (!interactivityLocked && chartState.value < MAX) {
      chartState.value++;
      renderAll(currentD3);
      sendChartState();
    }
  });

// ============================================
// PRIMARY ACTION BUTTON
// ============================================

const addBtn = container
  .append("button")
  .attr("type", "button")
  .style("padding", "10px 20px")
  .style("background", "#3b82f6")
  .style("color", "white")
  .style("border", "none")
  .style("border-radius", "8px")
  .style("font-size", "16px")
  .style("font-weight", "600")
  .style("cursor", interactivityLocked ? "not-allowed" : "pointer")
  .style("opacity", interactivityLocked ? "0.5" : "1")
  .text("+ Add Item")
  .on("click", () => {
    if (!interactivityLocked) {
      // Handle click
      sendChartState();
    }
  });

// ============================================
// CLICKABLE CARD SELECTION
// ============================================

OPTIONS.forEach((option) => {
  const card = container
    .append("div")
    .style("background", chartState.selected === option.id ? "#eff6ff" : "#ffffff")
    .style("border", `2px solid ${chartState.selected === option.id ? "#3b82f6" : "#e5e7eb"}`)
    .style("border-radius", "12px")
    .style("padding", "16px")
    .style("margin-bottom", "12px")
    .style("cursor", interactivityLocked ? "default" : "pointer")
    .style("transition", "all 0.2s")
    .on("click", () => {
      if (!interactivityLocked) {
        chartState.selected = option.id;
        renderAll(currentD3);
        sendChartState();
      }
    });

  card.append("div")
    .style("font-size", "18px")
    .style("font-weight", "600")
    .text(option.display);
});
