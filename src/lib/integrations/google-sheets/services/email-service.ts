import nodemailer from "nodemailer";
import { ExportResult } from "@zod-schema/integrations/google-sheets-export";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // Configure based on your email provider
      service: "gmail", // or your preferred service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
      },
    });
  }

  async sendDuplicateAlert(
    result: ExportResult,
    userEmail: string,
    spreadsheetUrl: string,
  ): Promise<boolean> {
    try {
      const subject = "🚨 Google Sheets Export - Manual Check Needed";

      let body = `A data export was initiated by ${userEmail}, but potential duplicates were detected:\n\n`;

      body += `📊 SHEETS PROCESSED:\n`;
      result.processedSheets.forEach((sheet) => {
        const status = sheet.error ? "❌" : sheet.duplicatesFound ? "⚠️" : "✅";
        body += `${status} ${sheet.name}: ${sheet.rowsExported} rows\n`;
      });

      body += `\n🚨 DUPLICATES FOUND:\n`;
      result.duplicateDetails.forEach((duplicate) => {
        body += `• ${duplicate.new} --[matching]--> ${duplicate.existing}\n`;
      });

      body += `\nPlease review the spreadsheet to verify the data.\n`;
      body += `Export initiated at: ${new Date()}\n`;
      body += `Spreadsheet: ${spreadsheetUrl}`;

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ALERT_EMAIL || userEmail,
        subject,
        text: body,
      });

      return true;
    } catch (error) {
      console.error("Failed to send email alert:", error);
      return false;
    }
  }
}
