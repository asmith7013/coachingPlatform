import nodemailer from 'nodemailer';

export interface IncentiveSubmissionData {
  teacherName: string;
  section: string;
  unitTitle?: string;
  date: string;
  studentCount: number;
  activityBreakdown: { label: string; count: number }[];
}

export class IncentiveEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendSubmissionNotification(data: IncentiveSubmissionData): Promise<boolean> {
    try {
      // Check if email is configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('⚠️ Email not configured - skipping notification');
        return false;
      }

      // Define recipient email addresses directly
      const recipients = [
        'asmith7013@gmail.com',
        'mika.asaba@teachinglabstudio.com',
        'tran.hoang@teachinglabstudio.com',
      ].join(', ');

      const subject = `📊 New Incentive Activities Logged - ${data.section} (${data.date})`;

      let body = `New student activities have been logged in the Incentive Tracker:\n\n`;

      body += `👤 LOGGED BY:\n`;
      body += `   ${data.teacherName}\n\n`;

      body += `📚 DETAILS:\n`;
      body += `   Section: ${data.section}\n`;
      if (data.unitTitle) {
        body += `   Unit: ${data.unitTitle}\n`;
      }
      body += `   Date: ${data.date}\n`;
      body += `   Students: ${data.studentCount}\n\n`;

      body += `📋 ACTIVITIES BREAKDOWN:\n`;
      data.activityBreakdown.forEach(activity => {
        body += `   • ${activity.label}: ${activity.count} student${activity.count !== 1 ? 's' : ''}\n`;
      });

      body += `\n⏰ Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}\n`;
      body += `\n🔗 View data: https://www.solvescoaching.com/incentives/data`;

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipients,
        subject,
        text: body
      });

      console.log('✅ Email notification sent successfully to:', recipients);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email notification:', error);
      return false;
    }
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email configuration is valid');
      return true;
    } catch (error) {
      console.error('❌ Email configuration error:', error);
      return false;
    }
  }
}
