import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@server/auth/api-key";
import { getEmailService } from "@/lib/email/email-service";

/**
 * Diagnostic endpoint to test email configuration and sending.
 *
 * GET /api/podsie/incentives/test-email
 * Returns: { configured, connectionValid, sendResult? }
 *
 * Protected by API key. Tests:
 * 1. Whether EMAIL_USER / EMAIL_PASSWORD env vars are set
 * 2. Whether the SMTP transporter can connect (verify)
 * 3. Optionally sends a test email if ?send=true
 */

export async function GET(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  const shouldSend = new URL(req.url).searchParams.get("send") === "true";

  const emailService = getEmailService();
  const configured = emailService.isConfigured();

  const diagnostics: Record<string, unknown> = {
    configured,
    emailUser: process.env.EMAIL_USER
      ? `${process.env.EMAIL_USER.slice(0, 4)}...`
      : "NOT SET",
    emailPasswordSet: !!process.env.EMAIL_PASSWORD,
  };

  if (!configured) {
    return NextResponse.json({ success: false, ...diagnostics });
  }

  try {
    const connectionValid = await emailService.testConnection();
    diagnostics.connectionValid = connectionValid;
  } catch (error) {
    diagnostics.connectionValid = false;
    diagnostics.connectionError =
      error instanceof Error ? error.message : String(error);
  }

  if (shouldSend) {
    const sendResult = await emailService.send({
      to: process.env.EMAIL_USER!,
      subject: "[Test] Incentive Email Diagnostic",
      body: `Test email sent at ${new Date().toISOString()} from the incentives test-email endpoint.`,
    });
    diagnostics.sendResult = sendResult;
  }

  return NextResponse.json({ success: true, ...diagnostics });
}
