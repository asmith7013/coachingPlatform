/**
 * Downloads a PPTX file locally on localhost by calling the export-pptx endpoint.
 * This is useful during development to inspect the generated PowerPoint files.
 *
 * @param slides - Array of slide objects with slideNumber and htmlContent
 * @param title - The title for the PPTX file
 * @param mathConcept - Optional math concept for metadata
 */
export async function downloadPptxLocally(
  slides: { slideNumber: number; htmlContent: string }[],
  title: string,
  mathConcept?: string,
): Promise<void> {
  // Only download on localhost
  if (
    typeof window === "undefined" ||
    window.location.hostname !== "localhost"
  ) {
    return;
  }

  try {
    console.log("[downloadPptxLocally] Downloading PPTX locally...");
    const pptxResponse = await fetch("/api/scm/worked-examples/export-pptx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slides,
        title: title || "worked-example",
        mathConcept,
      }),
    });

    if (pptxResponse.ok) {
      const blob = await pptxResponse.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${(title || "worked-example").replace(/[^a-zA-Z0-9-]/g, "-")}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      console.log("[downloadPptxLocally] PPTX download triggered");
    } else {
      console.error(
        "[downloadPptxLocally] PPTX download failed:",
        pptxResponse.status,
      );
    }
  } catch (err) {
    console.error("[downloadPptxLocally] PPTX download error:", err);
  }
}
