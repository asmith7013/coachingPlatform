// Component Usage Snippets
// Copy and adapt these patterns for your question

// ============================================
// VIDEO ACCORDION (COMPONENT)
// ============================================

const WORKED_EXAMPLE_VIDEO_URL = "https://example.com/video.mp4";

createVideoAccordion(d3, content, WORKED_EXAMPLE_VIDEO_URL);

// With options
createVideoAccordion(d3, content, WORKED_EXAMPLE_VIDEO_URL, {
  title: "▶ Watch Help Video",
  label: "Need Help?",
  maxWidth: "800px"
});

// ============================================
// VIDEO PLAYER (COMPONENT)
// ============================================

const VIDEO_URL = "https://example.com/video.mp4";

createVideoPlayer(d3, content, VIDEO_URL);

// With options
createVideoPlayer(d3, content, VIDEO_URL, {
  description: "Watch this video carefully!",
  maxWidth: "800px",
  marginBottom: "32px",
  showCard: true  // Default true, set false for no card styling
});

