import { sendEmail } from './email-service';

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

// Default recipient for scraper notifications
const SCRAPER_RECIPIENT = 'asmith7013@gmail.com';

/**
 * Build email body for missing students notification
 */
function buildMissingStudentsEmailBody(data: MissingStudentData): string {
  const sourceName = data.source === 'zearn' ? 'Zearn' : 'Roadmaps';

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

  return body;
}

export class ScraperEmailService {
  async sendMissingStudentsNotification(data: MissingStudentData): Promise<boolean> {
    const sourceName = data.source === 'zearn' ? 'Zearn' : 'Roadmaps';
    const subject = `Missing Students Found During ${sourceName} Import`;
    const body = buildMissingStudentsEmailBody(data);

    const result = await sendEmail({
      to: SCRAPER_RECIPIENT,
      subject,
      body
    });

    return result.success;
  }
}
