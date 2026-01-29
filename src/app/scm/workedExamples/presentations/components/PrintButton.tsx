'use client';

import type { PrintButtonProps } from '../types';

export function PrintButton({ slide }: PrintButtonProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Strip embedded <style> blocks from AI-generated HTML so only our styles apply
    const cleanedContent = slide.htmlContent.replace(/<style[\s\S]*?<\/style>/gi, '');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Worksheet</title>
        <style>
          @page {
            size: letter portrait;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .slide-container {
            display: block !important;
            position: static !important;
            width: 8.5in !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-page {
            display: block !important;
            width: 8.5in !important;
            height: 10.5in !important;
            overflow: hidden !important;
            margin: 0.25in 0 !important;
            padding: 0.5in !important;
            border: none !important;
            box-sizing: border-box !important;
            background: white !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
          }
          .print-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        </style>
        ${slide.customCSS ? `<style>${slide.customCSS}</style>` : ''}
      </head>
      <body>
        ${cleanedContent}
      </body>
      </html>
    `);
    printWindow.document.close();

    // Directly override inline styles on DOM elements for Safari compatibility
    const container = printWindow.document.querySelector('.slide-container') as HTMLElement;
    if (container) {
      container.style.cssText = 'display:block;position:static;width:8.5in;height:auto;overflow:visible;background:white;margin:0;padding:0;';
    }
    const pages = printWindow.document.querySelectorAll('.print-page') as NodeListOf<HTMLElement>;
    pages.forEach((page) => {
      page.style.cssText = 'display:block;width:8.5in;height:10.5in;overflow:hidden;margin:0.25in 0;padding:0.5in;border:none;box-sizing:border-box;background:white;page-break-after:always;';
    });
    if (pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      lastPage.style.pageBreakAfter = 'auto';
      lastPage.style.setProperty('break-after', 'auto');
    }

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <button
      onClick={handlePrint}
      className="print-hide fixed top-20 right-4 h-10 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-full z-[10000] text-sm font-semibold transition-colors cursor-pointer"
      aria-label="Print worksheet"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
        />
      </svg>
      Print
    </button>
  );
}
