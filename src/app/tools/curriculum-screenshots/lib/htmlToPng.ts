import { chromium } from "playwright";

/**
 * Convert HTML content to PNG
 * @param htmlContent - raw HTML
 * @param outputPath - output path where PNG will be saved
 */
export async function htmlToPng(
  htmlContent: string,
  outputPath: string
): Promise<void> {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1000, height: 100 },
    deviceScaleFactor: 2
  });
  const fullHtml = `
		<!DOCTYPE html>
		<html>
		<head>
		<style>
			body {
			font-family: Arial, sans-serif;
			font-size: 18px;
			padding: 40px;
			background: white;
			max-width: 750px;
			margin: 0 auto;
			line-height: 1.7;
			color: #333;
			}
			h1, h2, h3, h4, h5, h6 {
			font-family: Arial, sans-serif;
			margin-top: 1em;
			margin-bottom: 0.5em;
			font-weight: bold;
			}
			h1 { font-size: 2em; }
			h2 { font-size: 1.5em; }
			h3 { font-size: 1.17em; }
			p {
			margin: 0.8em 0;
			font-size: 18px;
			}
			.math {
			display: inline-block;
			vertical-align: middle;
			}
			ol {
          		padding-left: 35px;
			margin: 1em 0;
        	}
			li {
				margin: 60px 0;
				font-size: 18px;
			}
			table {
				border-collapse: collapse;
				margin: 20px 0;
				width: 100%;
			}
			td, th {
				border: 1px solid #ddd;
				padding: 12px;
				text-align: left;
				font-size: 18px;
				min-height: 50px;
				height: 50px;
			}
			tr {
  				min-height: 50px;
			}
			th {
				background-color: #f2f2f2;
			}
			img {
				max-width: 100%;
				height: auto;
				display: block;
				margin: 15px 0;
			}
			.screenreader-only {
				display: none !important;
			}
		</style>
		</head>
		<body>${htmlContent}</body>
		</html>
	`;

  await page.setContent(fullHtml);
  await page.waitForTimeout(500);

  await page.screenshot({
    path: outputPath,
    fullPage: true,
  });

  await browser.close();
}
