// Card and Layout Snippets
// Copy and adapt these patterns for your question

// ============================================
// STANDARD CARD WITH TITLE
// ============================================

const card = createStandardCard(d3, content, {
  title: "Complete the table:",
  size: "large",  // large, medium, small, graph
  className: "table-card",
  marginBottom: "32px"
});

// Add content to the card
card.append("div").text("Content here...");

// ============================================
// TWO-COLUMN LAYOUT
// ============================================

const { leftColumn, rightColumn } = createTwoColumnLayout(d3, content, {
  gap: "32px",
  columns: "1fr 1fr",
  marginBottom: "32px"
});

createStandardCard(d3, leftColumn, { size: "large" });
createStandardCard(d3, rightColumn, { size: "large" });

// ============================================
// INTRO CARDS (EMOJI + TEXT)
// ============================================

const introContainer = content
  .append("div")
  .style("display", "grid")
  .style("grid-template-columns", "auto 1fr")
  .style("gap", "16px")
  .style("margin-bottom", "24px")
  .style("align-items", "center");

// Emoji card
const emojiCard = createStandardCard(d3, introContainer, {
  size: "small",
  marginBottom: "0"
});
emojiCard
  .style("display", "flex")
  .style("align-items", "center")
  .style("justify-content", "center")
  .append("div")
  .style("font-size", "48px")
  .text("🎬");

// Text card
const textCard = createStandardCard(d3, introContainer, {
  size: "small",
  marginBottom: "0"
});
textCard
  .append("div")
  .style("font-size", "16px")
  .style("line-height", "1.6")
  .text("Your scenario text...");
