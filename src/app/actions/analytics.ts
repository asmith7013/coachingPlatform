"use server";

import PageView from '@/lib/schema/mongoose-schema/PageView';
import Session from '@/lib/schema/mongoose-schema/Session';
import { PageViewSchema, AnalyticsQuerySchema } from '@/lib/schema/zod-schema/analytics';
import { connectToDB } from '@server/db/connection';
import { handleServerError } from "@error/handlers/server";
import type { PageView as PageViewType, AnalyticsQuery } from '@/lib/schema/zod-schema/analytics';
import type { Types } from 'mongoose';

/**
 * Track a page view
 */
export async function trackPageView(data: Omit<PageViewType, 'timestamp'>) {
  try {
    await connectToDB();

    // Validate input
    const validated = PageViewSchema.parse({
      ...data,
      timestamp: new Date(),
    });

    // Create page view record
    const pageView = await PageView.create(validated);

    // Update session
    await Session.findOneAndUpdate(
      { sessionId: validated.sessionId },
      {
        $set: {
          userId: validated.userId,
          userAgent: validated.userAgent,
        },
        $inc: { pageViews: 1 },
        $setOnInsert: {
          startTime: new Date(),
        },
      },
      { upsert: true }
    );

    // Return only the _id as a plain string
    return { success: true, data: { _id: pageView._id.toString() } };
  } catch (error) {
    return { success: false, error: handleServerError(error, "Failed to track page view") };
  }
}

/**
 * Update page view duration (called when user leaves page)
 */
export async function updatePageViewDuration(pageViewId: string, duration: number) {
  try {
    await connectToDB();

    const pageView = await PageView.findByIdAndUpdate(
      pageViewId,
      { $set: { duration } },
      { new: true }
    );

    if (!pageView) {
      return { success: false, error: "Page view not found" };
    }

    // Update session total duration
    await Session.findOneAndUpdate(
      { sessionId: pageView.sessionId },
      { $inc: { totalDuration: duration } }
    );

    // Return only the _id as a plain string
    return { success: true, data: { _id: pageView._id.toString() } };
  } catch (error) {
    return { success: false, error: handleServerError(error, "Failed to update page view duration") };
  }
}

/**
 * Get analytics data
 */
export async function getAnalytics(query: AnalyticsQuery) {
  try {
    await connectToDB();

    const validated = AnalyticsQuerySchema.parse(query);

    const filter: Record<string, unknown> = {};

    if (validated.userId) {
      filter.userId = validated.userId;
    }

    if (validated.page) {
      filter.page = validated.page;
    }

    if (validated.startDate || validated.endDate) {
      filter.timestamp = {};
      if (validated.startDate) {
        (filter.timestamp as Record<string, unknown>).$gte = validated.startDate;
      }
      if (validated.endDate) {
        (filter.timestamp as Record<string, unknown>).$lte = validated.endDate;
      }
    }

    const pageViews = await PageView.find(filter)
      .sort({ timestamp: -1 })
      .limit(validated.limit)
      .skip(validated.offset)
      .lean();

    const total = await PageView.countDocuments(filter);

    return {
      success: true,
      data: {
        pageViews: pageViews.map(pv => ({
          ...pv,
          _id: (pv._id as Types.ObjectId).toString(),
        })),
        total,
        limit: validated.limit,
        offset: validated.offset,
      },
    };
  } catch (error) {
    return { success: false, error: handleServerError(error, "Failed to fetch analytics") };
  }
}

/**
 * Get aggregated analytics stats
 */
export async function getAnalyticsStats(userId?: string, startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();

    const matchStage: Record<string, unknown> = {};

    if (userId) {
      matchStage.userId = userId;
    }

    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) {
        (matchStage.timestamp as Record<string, unknown>).$gte = startDate;
      }
      if (endDate) {
        (matchStage.timestamp as Record<string, unknown>).$lte = endDate;
      }
    }

    // Most visited pages
    const topPages = await PageView.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: '$page',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          page: '$_id',
          views: '$count',
          avgDuration: { $round: ['$avgDuration', 2] },
          _id: 0,
        },
      },
    ]);

    // Daily page views
    const dailyViews = await PageView.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          views: '$count',
          uniqueUsers: { $size: '$uniqueUsers' },
          _id: 0,
        },
      },
    ]);

    // Total stats
    const totalViews = await PageView.countDocuments(matchStage);
    const uniqueUsers = await PageView.distinct('userId', matchStage);
    const avgDuration = await PageView.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
        },
      },
    ]);

    return {
      success: true,
      data: {
        totalViews,
        uniqueUsers: uniqueUsers.length,
        avgDuration: avgDuration[0]?.avgDuration || 0,
        topPages,
        dailyViews,
      },
    };
  } catch (error) {
    return { success: false, error: handleServerError(error, "Failed to fetch analytics stats") };
  }
}

/**
 * Get user's browsing history
 */
export async function getUserHistory(userId: string, limit = 50) {
  try {
    await connectToDB();

    const pageViews = await PageView.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: pageViews.map(pv => ({
        ...pv,
        _id: (pv._id as Types.ObjectId).toString(),
      })),
    };
  } catch (error) {
    return { success: false, error: handleServerError(error, "Failed to fetch user history") };
  }
}
