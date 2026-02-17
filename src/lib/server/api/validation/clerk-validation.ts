import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { z } from "zod";

// Webhook header validation schema
export const ClerkWebhookHeadersSchema = z.object({
  "svix-id": z.string(),
  "svix-timestamp": z.string(),
  "svix-signature": z.string(),
});

// Webhook validation result type
export type WebhookValidationResult = {
  isValid: boolean;
  error?: string;
  payload?: WebhookEvent;
  headers?: z.infer<typeof ClerkWebhookHeadersSchema>;
};

// Main validation function
export async function validateClerkWebhook(
  request: Request,
  webhookSecret: string,
): Promise<WebhookValidationResult> {
  try {
    // Await headers for App Router
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // Validate headers
    const headerValidation = ClerkWebhookHeadersSchema.safeParse({
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    if (!headerValidation.success) {
      return {
        isValid: false,
        error: "Missing required svix headers",
      };
    }

    // Get and validate the body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Create Svix instance and verify
    const wh = new Webhook(webhookSecret);

    try {
      const evt = wh.verify(body, {
        "svix-id": svix_id as string,
        "svix-timestamp": svix_timestamp as string,
        "svix-signature": svix_signature as string,
      }) as WebhookEvent;

      return {
        isValid: true,
        payload: evt,
        headers: headerValidation.data,
      };
    } catch (verifyError: unknown) {
      return {
        isValid: false,
        error:
          verifyError instanceof Error
            ? verifyError.message
            : "Webhook verification failed",
      };
    }
  } catch (error: unknown) {
    console.error("Error validating webhook:", error);
    return {
      isValid: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during webhook validation",
    };
  }
}
