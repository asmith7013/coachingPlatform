import nodemailer from 'nodemailer';

export interface MissingStudentData {
  source: 'zearn' | 'roadmaps';
  missingStudents: Array<{
    sisId: string;
    firstName?: string;
    lastName?: string;
  }>;
  totalProcessed: number;
  timestamp: string;
}

export class ScraperEmailService {
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

  async sendMissingStudentsNotification(data: MissingStudentData): Promise<boolean> {
    try {
      // Check if email is configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('Email not configured - skipping notification');
        return false;
      }

      // Only send to Alex for scraper notifications
      const recipient = 'asmith7013@gmail.com';

      const sourceName = data.source === 'zearn' ? 'Zearn' : 'Roadmaps';
      const subject = `Missing Students Found During ${sourceName} Import`;

      let body = `Missing students were found during ${sourceName} data import:\n\n`;

      body += `SUMMARY:\n`;
      body += `   Total records processed: ${data.totalProcessed}\n`;
      body += `   Missing students: ${data.missingStudents.length}\n\n`;

      body += `MISSING STUDENTS:\n`;
      data.missingStudents.forEach((student, index) => {
        const name = student.firstName && student.lastName
          ? `${student.lastName}, ${student.firstName}`
          : 'Unknown name';
        body += `   ${index + 1}. SIS ID: ${student.sisId} - ${name}\n`;
      });

      body += `\nTimestamp: ${data.timestamp}\n`;
      body += `\nThese students need to be added to the database before their data can be imported.`;

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient,
        subject,
        text: body
      });

      console.log('Email notification sent for missing students to:', recipient);
      return true;
    } catch (error) {
      console.error('Failed to send missing students notification:', error);
      return false;
    }
  }
}
