import { NextResponse } from 'next/server';
import { validateClerkWebhook } from '@server/api/validation/clerk-validation';
import { handleUserSync, handleOrganizationSync, handleUserDeletion } from '@server/api/handlers/clerk-webhook';
import { UserJSON, OrganizationJSON, DeletedObjectJSON } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    // Validate the webhook
    const validation = await validateClerkWebhook(
      request,
      process.env.CLERK_WEBHOOK_SECRET || ''
    );

    if (!validation.isValid || !validation.payload) {
      return NextResponse.json(
        { error: validation.error || 'Invalid webhook' },
        { status: 400 }
      );
    }

    const { type, data } = validation.payload;

    // Handle different webhook events
    switch (type) {
      case 'user.created':
      case 'user.updated':
        const userResult = await handleUserSync(data as UserJSON);
        return NextResponse.json(userResult);

      case 'organization.created':
      case 'organization.updated':
        const orgResult = await handleOrganizationSync(data as OrganizationJSON);
        return NextResponse.json(orgResult);

      case 'user.deleted':
        const deleteResult = await handleUserDeletion(data as DeletedObjectJSON);
        return NextResponse.json(deleteResult);

      default:
        console.log(`Unhandled webhook type: ${type}`);
        return NextResponse.json(
          { message: 'Webhook received but not handled' },
          { status: 200 }
        );
    }
  } catch (error: unknown) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 