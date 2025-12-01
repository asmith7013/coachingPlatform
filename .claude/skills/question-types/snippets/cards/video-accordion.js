// Video Accordion Component
// Copy this function into your chart.js IIFE

/**
 * Video Accordion Component
 * Creates an optional video accordion component.
 */
function createVideoAccordion(d3, container, videoUrl, options) {
  options = options || {};

  const title =
    options.title ||
    "▶ [If you're stuck] Watch the Worked Example Video Again";
  const expandedTitle =
    options.expandedTitle ||
    "▼ [If you're stuck] Watch the Worked Example Video Again";
  const label = options.label || "Optional:";
  const maxWidth = options.maxWidth || "600px";

  // If no video URL is provided, don't render anything
  if (!videoUrl) {
    return null;
  }

  // Optional label
  container
    .append("div")
    .attr("class", "video-accordion-label")
    .style("font-size", "14px")
    .style("font-weight", "500")
    .style("margin-top", "32px")
    .style("margin-bottom", "8px")
    .style("color", "#6b7280")
    .text(label);

  // Accordion container
  const accordionContainer = container
    .append("details")
    .attr("class", "video-accordion")
    .style("background", "#f9fafb")
    .style("border", "1px solid #e5e7eb")
    .style("border-radius", "12px")
    .style("padding", "16px")
    .style("margin-bottom", "20px");

  // Summary (clickable header)
  accordionContainer
    .append("summary")
    .style("cursor", "pointer")
    .style("font-weight", "600")
    .style("font-size", "15px")
    .style("color", "#3b82f6")
    .style("list-style", "none")
    .style("display", "flex")
    .style("align-items", "center")
    .style("gap", "8px")
    .html(title)
    .on("click", function (event) {
      const details = d3.select(this.parentNode);
      const isOpen = details.property("open");
      d3.select(this).html(isOpen ? title : expandedTitle);
    });

  // Video content
  const videoContent = accordionContainer
    .append("div")
    .attr("class", "video-content")
    .style("margin-top", "16px");

  videoContent
    .append("video")
    .attr("controls", true)
    .attr("src", videoUrl)
    .style("width", "100%")
    .style("max-width", maxWidth)
    .style("border-radius", "8px")
    .style("display", "block");

  return accordionContainer;
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Basic usage:
const WORKED_EXAMPLE_VIDEO_URL = "https://example.com/video.mp4";
createVideoAccordion(d3, content, WORKED_EXAMPLE_VIDEO_URL);

// With custom options:
createVideoAccordion(d3, content, WORKED_EXAMPLE_VIDEO_URL, {
  title: "▶ Watch Help Video",
  expandedTitle: "▼ Hide Help Video",
  label: "Need Help?",
  maxWidth: "800px"
});
