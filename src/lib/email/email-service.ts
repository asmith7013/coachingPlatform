import nodemailer from 'nodemailer';

// =====================================
// TYPES
// =====================================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
}

export interface EmailResult {
  success: boolean;
  error?: string;
}

// =====================================
// EMAIL SERVICE
// =====================================

/**
 * Generic email service for sending emails via nodemailer
 *
 * Usage:
 * ```ts
 * const emailService = new EmailService();
 * await emailService.send({
 *   to: ['user@example.com', 'other@example.com'],
 *   subject: 'Hello',
 *   body: 'This is the email body'
 * });
 * ```
 */
export class EmailService {
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

  /**
   * Check if email is configured
   */
  isConfigured(): boolean {
    return !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
  }

  /**
   * Send an email
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      if (!this.isConfigured()) {
        console.warn('Email not configured - skipping notification');
        return { success: false, error: 'Email not configured' };
      }

      const recipients = Array.isArray(options.to)
        ? options.to.join(', ')
        : options.to;

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipients,
        subject: options.subject,
        text: options.body,
        ...(options.html && { html: options.html })
      });

      console.log('Email sent successfully to:', recipients);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to send email:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email configuration is valid');
      return true;
    } catch (error) {
      console.error('Email configuration error:', error);
      return false;
    }
  }
}

// Singleton instance for convenience
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

/**
 * Convenience function to send an email without instantiating the service
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  return getEmailService().send(options);
}
