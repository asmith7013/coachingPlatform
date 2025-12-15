"use server";

import { withDbConnection } from '@server/db/ensure-connection';
import { handleServerError } from '@error/handlers/server';
import { put } from "@vercel/blob";
import { auth, currentUser } from "@clerk/nextjs/server";
import { WorkedExampleRequestModel } from '@mongoose-schema/scm/podsie/worked-example-request.model';
import {
  WorkedExampleRequestInputZodSchema,
  WorkedExampleRequestQuerySchema,
  type WorkedExampleRequestInput,
  type WorkedExampleRequestQuery,
  type WorkedExampleRequestStatus
} from '@zod-schema/scm/podsie/worked-example-request';
import { sendEmail } from '@/lib/email/email-service';

// =====================================
// IMAGE UPLOAD
// =====================================

export async function uploadWorkedExampleImage(
  imageData: Uint8Array,
  filename: string,
  contentType: string = "image/png"
) {
  try {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blobFileName = `worked-example-requests/${sanitizedFilename}-${timestamp}`;

    const imageBlob = new Blob([imageData], { type: contentType });
    const blob = await put(blobFileName, imageBlob, {
      access: "public",
      contentType,
    });

    return {
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    };
  } catch (error) {
    console.error("Error uploading image to Vercel Blob:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}

// =====================================
// CREATE REQUEST
// =====================================

export async function createWorkedExampleRequest(input: WorkedExampleRequestInput) {
  return withDbConnection(async () => {
    try {
      // Get current user
      const { userId } = await auth();
      if (!userId) {
        return {
          success: false,
          error: "Unauthorized - please sign in",
        };
      }

      // Get user email for notifications
      const user = await currentUser();
      const userEmail = user?.emailAddresses?.[0]?.emailAddress;

      // Validate input
      const validated = WorkedExampleRequestInputZodSchema.parse({
        ...input,
        requestedBy: userId,
        requestedByEmail: userEmail,
        status: "pending",
      });

      // Create the request
      const request = new WorkedExampleRequestModel(validated);
      await request.save();

      // Send email notification
      await sendRequestNotification(request.toJSON());

      return {
        success: true,
        data: JSON.parse(JSON.stringify(request.toJSON())),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to create worked example request'),
      };
    }
  });
}

// =====================================
// GET REQUESTS (for queue view)
// =====================================

export async function getWorkedExampleRequests(query?: WorkedExampleRequestQuery) {
  return withDbConnection(async () => {
    try {
      // Validate query params if provided
      const validated = query ? WorkedExampleRequestQuerySchema.parse(query) : {};

      // Build filter
      const filter: Record<string, unknown> = {};
      if (validated.status) filter.status = validated.status;
      if (validated.scopeSequenceTag) filter.scopeSequenceTag = validated.scopeSequenceTag;
      if (validated.grade) filter.grade = validated.grade;
      if (validated.unitNumber) filter.unitNumber = validated.unitNumber;
      if (validated.lessonNumber) filter.lessonNumber = validated.lessonNumber;
      if (validated.requestedBy) filter.requestedBy = validated.requestedBy;

      // Fetch requests, sorted by status priority then newest first
      const requests = await WorkedExampleRequestModel.find(filter)
        .sort({
          // Custom sort: pending first, then in_progress, then others
          status: 1,
          createdAt: -1
        });

      // Sort manually to ensure pending comes first
      const sortedRequests = requests.sort((a, b) => {
        const statusOrder: Record<string, number> = {
          pending: 0,
          in_progress: 1,
          completed: 2,
          cancelled: 3
        };
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        // If same status, sort by createdAt descending
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return {
        success: true,
        data: sortedRequests.map(r => JSON.parse(JSON.stringify(r.toJSON()))),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to fetch worked example requests'),
      };
    }
  });
}

// =====================================
// GET SINGLE REQUEST
// =====================================

export async function getWorkedExampleRequestById(id: string) {
  return withDbConnection(async () => {
    try {
      const request = await WorkedExampleRequestModel.findById(id);

      if (!request) {
        return {
          success: false,
          error: 'Worked example request not found',
        };
      }

      return {
        success: true,
        data: JSON.parse(JSON.stringify(request.toJSON())),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to fetch worked example request'),
      };
    }
  });
}

// =====================================
// UPDATE REQUEST STATUS
// =====================================

export async function updateWorkedExampleRequestStatus(
  id: string,
  status: WorkedExampleRequestStatus,
  completedWorkedExampleId?: string
) {
  return withDbConnection(async () => {
    try {
      const updateData: Record<string, unknown> = { status };
      if (completedWorkedExampleId) {
        updateData.completedWorkedExampleId = completedWorkedExampleId;
      }

      const request = await WorkedExampleRequestModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      if (!request) {
        return {
          success: false,
          error: 'Worked example request not found',
        };
      }

      return {
        success: true,
        data: JSON.parse(JSON.stringify(request.toJSON())),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to update worked example request status'),
      };
    }
  });
}

// =====================================
// EMAIL NOTIFICATION
// =====================================

interface RequestData {
  lessonName: string;
  scopeSequenceTag: string;
  unitNumber: number;
  lessonNumber: number;
  mathConcept: string;
  mathStandard: string;
  strugglingSkillNumbers: string[];
  strugglingDescription: string;
  sourceImageUrl: string;
  requestedByEmail?: string;
  additionalNotes?: string;
  _id: string;
}

async function sendRequestNotification(requestData: RequestData): Promise<boolean> {
  const subject = `New Worked Example Request - ${requestData.lessonName}`;

  let body = `A new worked example request has been submitted:\n\n`;

  body += `LESSON DETAILS:\n`;
  body += `   Curriculum: ${requestData.scopeSequenceTag}\n`;
  body += `   Unit ${requestData.unitNumber}, Lesson ${requestData.lessonNumber}\n`;
  body += `   Lesson: ${requestData.lessonName}\n\n`;

  body += `MATH CONTEXT:\n`;
  body += `   Concept: ${requestData.mathConcept}\n`;
  body += `   Standard: ${requestData.mathStandard}\n\n`;

  body += `STRUGGLING SKILLS:\n`;
  body += `   Skills: ${requestData.strugglingSkillNumbers.join(', ')}\n`;
  body += `   Description: ${requestData.strugglingDescription}\n\n`;

  body += `SOURCE IMAGE:\n`;
  body += `   ${requestData.sourceImageUrl}\n\n`;

  if (requestData.additionalNotes) {
    body += `ADDITIONAL NOTES:\n`;
    body += `   ${requestData.additionalNotes}\n\n`;
  }

  body += `REQUESTED BY:\n`;
  body += `   ${requestData.requestedByEmail || 'Unknown'}\n\n`;

  body += `Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}\n`;
  body += `\nView queue: https://www.solvescoaching.com/scm/workedExamples/request/admin`;

  const result = await sendEmail({
    to: 'alex.smith@teachinglab.com',
    subject,
    body
  });

  return result.success;
}
