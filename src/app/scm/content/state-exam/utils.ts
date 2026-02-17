import type { StateTestQuestion } from "./types";

/**
 * Opens a new browser tab with selected questions formatted for printing.
 * Uses physical units (inches) for Safari compatibility.
 */
export function printSelectedQuestions(questions: StateTestQuestion[]): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to print questions");
    return;
  }

  // Generate HTML for each question
  const questionsHtml = questions
    .map(
      (q, index) => `
    <div class="question-page">
      <div class="question-header">
        <span class="standard">${q.standard}</span>
        <span class="meta">
          ${q.examYear}${q.points !== undefined ? ` | ${q.points}pt` : ""}${q.questionNumber ? ` | #${q.questionNumber}` : ""}
        </span>
      </div>
      <div class="question-image">
        <img src="${q.screenshotUrl}" alt="Question ${index + 1}" />
      </div>
    </div>
  `,
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>State Exam Questions</title>
      <style>
        @page {
          size: letter portrait;
          margin: 0.5in;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: white;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .question-page {
          display: flex;
          flex-direction: column;
          width: 7.5in;
          min-height: 9.5in;
          padding: 0.25in;
          box-sizing: border-box;
          page-break-after: always;
          page-break-inside: avoid;
        }
        .question-page:last-child {
          page-break-after: auto;
        }
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25in;
          font-size: 12pt;
          color: #333;
        }
        .standard {
          font-weight: 600;
          background: #3b82f6;
          color: white;
          padding: 4px 12px;
          border-radius: 4px;
        }
        .meta {
          color: #666;
        }
        .question-image {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        img {
          max-width: 100%;
          max-height: 9in;
          object-fit: contain;
        }
      </style>
    </head>
    <body>
      ${questionsHtml}
    </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for images to load before printing
  const images = printWindow.document.querySelectorAll("img");
  let loadedCount = 0;
  const totalImages = images.length;

  const triggerPrint = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  if (totalImages === 0) {
    triggerPrint();
    return;
  }

  images.forEach((img) => {
    if (img.complete) {
      loadedCount++;
      if (loadedCount === totalImages) triggerPrint();
    } else {
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) triggerPrint();
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalImages) triggerPrint();
      };
    }
  });
}
