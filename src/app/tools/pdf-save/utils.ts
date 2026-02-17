import { pdfjs } from "react-pdf";
import JSZip from "jszip";

// Configure PDF.js worker for react-pdf using npm package
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/**
 * Extract pages from PDF as high-resolution PNG images
 */
export async function processPDF(file: File): Promise<Blob[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  const pageCount = pdf.numPages;

  const images: Blob[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 3.0 }); // Very high resolution

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
      // canvas: canvas
    }).promise;

    // Convert canvas to blob with high quality
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), "image/png", 1.0);
    });

    images.push(blob);
  }

  return images;
}

/**
 * Get page count from PDF file
 */
export async function getPDFPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  return pdf.numPages;
}

/**
 * Sanitize title for use in folder names
 */
export function sanitizeTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and dashes
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/-+/g, "-") // Replace multiple dashes with single dash
    .replace(/^-|-$/g, ""); // Remove leading/trailing dashes
}

/**
 * Create and download zip file with curricula folder structure
 */
export async function saveFilesToPublic(
  grade: string,
  unit: number,
  titles: string[],
  images: Blob[],
): Promise<void> {
  const zip = new JSZip();

  // Create the curricula folder structure
  const curriculaFolder = zip.folder("curricula")!;
  const gradeFolder = curriculaFolder.folder(grade)!;
  const unitFolder = gradeFolder.folder(`Unit-${unit}`)!;
  const rampUpsFolder = unitFolder.folder("ramp-ups")!;

  // Add each image to its respective lesson folder
  for (let i = 0; i < images.length; i++) {
    const sanitizedTitle = sanitizeTitle(titles[i]);
    const folderName = `ramp-up-${i + 1}-${sanitizedTitle}`;
    const lessonFolder = rampUpsFolder.folder(folderName)!;

    // Add the image as Cool-Down.png to the lesson folder
    lessonFolder.file("Cool-Down.png", images[i]);
  }

  // Generate and download the zip file
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `curricula-${grade}-Unit-${unit}-ramp-ups.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate titles
 */
export function parseTitles(titlesString: string): string[] {
  return titlesString
    .split("\n")
    .map((title) => title.trim())
    .filter((title) => title.length > 0);
}

/**
 * Validate form data
 */
export function validateForm(
  file: File | null,
  grade: string,
  unit: number,
  titles: string,
  pageCount: number,
): string | null {
  if (!file) return "Please select a PDF file";
  if (!grade) return "Please select a grade";
  if (unit < 1) return "Please enter a valid unit number";
  if (!titles.trim()) return "Please enter page titles";

  const titleArray = parseTitles(titles);
  if (titleArray.length !== pageCount) {
    return `Number of titles (${titleArray.length}) must match number of PDF pages (${pageCount})`;
  }

  return null;
}
