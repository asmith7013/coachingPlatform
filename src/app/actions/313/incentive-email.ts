import { sendEmail } from '@/lib/email/email-service';

export interface IncentiveSubmissionData {
  teacherName: string;
  section: string;
  unitTitle?: string;
  date: string;
  studentCount: number;
  activityBreakdown: { label: string; count: number }[];
}

// Default recipients for incentive notifications
const INCENTIVE_RECIPIENTS = [
  'asmith7013@gmail.com',
  'mika.asaba@teachinglabstudio.com',
  'tran.hoang@teachinglabstudio.com',
];

/**
 * Build email body for incentive submission notification
 */
function buildIncentiveEmailBody(data: IncentiveSubmissionData): string {
  let body = `New student activities have been logged in the Incentive Tracker:\n\n`;

  body += `LOGGED BY:\n`;
  body += `   ${data.teacherName}\n\n`;

  body += `DETAILS:\n`;
  body += `   Section: ${data.section}\n`;
  if (data.unitTitle) {
    body += `   Unit: ${data.unitTitle}\n`;
  }
  body += `   Date: ${data.date}\n`;
  body += `   Students: ${data.studentCount}\n\n`;

  body += `ACTIVITIES BREAKDOWN:\n`;
  data.activityBreakdown.forEach(activity => {
    body += `   - ${activity.label}: ${activity.count} student${activity.count !== 1 ? 's' : ''}\n`;
  });

  body += `\nSubmitted at: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}\n`;
  body += `\nView data: https://www.solvescoaching.com/incentives/data`;

  return body;
}

export class IncentiveEmailService {
  async sendSubmissionNotification(data: IncentiveSubmissionData): Promise<boolean> {
    const subject = `New Incentive Activities Logged - ${data.section} (${data.date})`;
    const body = buildIncentiveEmailBody(data);

    const result = await sendEmail({
      to: INCENTIVE_RECIPIENTS,
      subject,
      body
    });

    return result.success;
  }

  async testConnection(): Promise<boolean> {
    const { getEmailService } = await import('@/lib/email/email-service');
    return getEmailService().testConnection();
  }
}
