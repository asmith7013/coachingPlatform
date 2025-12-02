# Analytics Setup Guide

This project now has **three layers of analytics** tracking:

## 1. Vercel Analytics (Basic Site Metrics)

**What it tracks:**
- Page views
- Unique visitors
- Top pages
- Geographic data

**Setup:**
- ✅ Already installed and configured
- Automatically tracks all pages
- View data at: https://vercel.com/dashboard → Your Project → Analytics

**No additional configuration needed!**

---

## 2. PostHog (Advanced User Analytics)

**What it tracks:**
- User identification (via Clerk)
- Page views with user context
- Custom events
- Session recordings (optional)
- Feature flags (optional)

**Setup:**

1. **Create a PostHog account:**
   - Go to https://app.posthog.com/signup
   - Create a new project

2. **Get your API key:**
   - Go to Project Settings → API Keys
   - Copy your Project API Key

3. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

4. **Restart your app**
   ```bash
   # Stop your dev server and restart
   npm run dev
   ```

**Using PostHog:**

PostHog is initialized using Next.js 15.3+ instrumentation (`instrumentation-client.ts`) for optimal performance.

PostHog automatically:
- Identifies users with Clerk data (via `PostHogIdentifier`)
- Tracks page views (via `PostHogPageView`)
- Links events to specific users
- Provides debug mode in development

### Custom Event Tracking

Use the `useAnalytics` hook to track custom events:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

function MyComponent() {
  const { trackEvent, trackFeatureUsage } = useAnalytics()

  const handleButtonClick = () => {
    trackEvent('button_clicked', {
      button_name: 'submit',
      page: '/roadmaps'
    })
  }

  const handleFeatureUse = () => {
    trackFeatureUsage('roadmap_completed', {
      roadmapId: '123'
    })
  }

  return <button onClick={handleButtonClick}>Submit</button>
}
```

### Available Methods:

- `trackEvent(name, properties)` - Track any custom event
- `trackFeatureUsage(featureName, properties)` - Track feature usage
- `trackConversion(conversionName, value, properties)` - Track conversions
- `trackError(errorMessage, properties)` - Track errors

---

## 3. Custom MongoDB Analytics (Your Data)

**What it tracks:**
- Page views with full context
- User sessions
- Time spent on pages
- Custom metadata

**Advantages:**
- Own your data completely
- No external service limits
- Query however you want
- GDPR/privacy compliant

**Setup:**
- ✅ Already installed and configured
- Automatically tracks all pages
- Stores data in MongoDB collections:
  - `page-views` - Individual page view records
  - `sessions` - User session data

### Viewing Analytics Data

#### 1. Use the Dashboard Component

```typescript
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

export default function AdminPage() {
  return (
    <div>
      <h1>Site Analytics</h1>
      {/* Show all site analytics */}
      <AnalyticsDashboard />

      {/* Show analytics for a specific user */}
      <AnalyticsDashboard userId="user_123" />

      {/* Show analytics for a date range */}
      <AnalyticsDashboard
        startDate={new Date('2025-01-01')}
        endDate={new Date('2025-12-31')}
      />
    </div>
  )
}
```

#### 2. Use the User History Component

```typescript
import { UserHistory } from '@/components/analytics/UserHistory'

export default function UserProfilePage({ userId }: { userId: string }) {
  return (
    <div>
      <h1>User Browsing History</h1>
      <UserHistory userId={userId} limit={50} />
    </div>
  )
}
```

#### 3. Query Directly with Server Actions

```typescript
import {
  getAnalytics,
  getAnalyticsStats,
  getUserHistory
} from '@/app/actions/analytics'

// Get page views
const result = await getAnalytics({
  userId: 'user_123',
  page: '/roadmaps',
  startDate: new Date('2025-01-01'),
  limit: 100,
  offset: 0,
})

// Get aggregated stats
const stats = await getAnalyticsStats(
  'user_123', // optional userId
  new Date('2025-01-01'), // optional startDate
  new Date('2025-12-31') // optional endDate
)

// Get user's browsing history
const history = await getUserHistory('user_123', 50)
```

#### 4. Query MongoDB Directly

```bash
# Get total page views
mongosh "$DATABASE_URL" --eval "
  print('Total page views:', db['page-views'].countDocuments());
"

# Get most visited pages
mongosh "$DATABASE_URL" --eval "
  db['page-views'].aggregate([
    { \$group: { _id: '\$page', count: { \$sum: 1 } } },
    { \$sort: { count: -1 } },
    { \$limit: 10 }
  ]).forEach(printjson);
"

# Get a specific user's page views
mongosh "$DATABASE_URL" --eval "
  db['page-views'].find({
    userId: 'user_123'
  }).sort({ timestamp: -1 }).limit(20).forEach(printjson);
"

# Get daily page views
mongosh "$DATABASE_URL" --eval "
  db['page-views'].aggregate([
    {
      \$group: {
        _id: { \$dateToString: { format: '%Y-%m-%d', date: '\$timestamp' } },
        count: { \$sum: 1 },
        uniqueUsers: { \$addToSet: '\$userId' }
      }
    },
    { \$sort: { _id: 1 } },
    {
      \$project: {
        date: '\$_id',
        views: '\$count',
        uniqueUsers: { \$size: '\$uniqueUsers' },
        _id: 0
      }
    }
  ]).forEach(printjson);
"
```

---

## Data Retention

**Automatic Cleanup:**
- Page views and sessions are auto-deleted after 90 days
- Controlled by MongoDB TTL indexes
- Can be adjusted in the schema files:
  - `src/lib/schema/mongoose-schema/PageView.ts`
  - `src/lib/schema/mongoose-schema/Session.ts`

To change retention period, edit this line:
```typescript
// Change 90 to your desired number of days
{ expireAfterSeconds: 60 * 60 * 24 * 90 }
```

---

## Privacy & GDPR Compliance

**User Consent:**
You should add a cookie consent banner if tracking EU users. Consider using:
- [react-cookie-consent](https://www.npmjs.com/package/react-cookie-consent)
- Or build a custom banner

**Anonymizing Data:**
To track without user IDs:
```typescript
// In PageViewTracker.tsx, comment out these lines:
userId: user?.id,
clerkId: user?.id,
userEmail: user?.primaryEmailAddress?.emailAddress,
```

---

## Troubleshooting

### PostHog not tracking:
1. Check `NEXT_PUBLIC_POSTHOG_KEY` is set in `.env.local`
2. Restart your dev server
3. Check browser console for errors
4. Verify the key is correct in PostHog dashboard

### MongoDB not saving views:
1. Check `DATABASE_URL` is correct
2. Verify MongoDB is accessible
3. Check server console for errors
4. Test with: `mongosh "$DATABASE_URL" --eval "db.adminCommand('ping')"`

### Vercel Analytics not showing data:
1. Deploy to Vercel (doesn't work in local dev)
2. Wait 24 hours for data to appear
3. Check you're on the correct Vercel project

---

## Example: Complete Analytics Page

Here's a complete example of an analytics admin page:

```typescript
// app/admin/analytics/page.tsx
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Site Analytics</h1>

      <div className="space-y-8">
        {/* Last 30 days */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Last 30 Days</h2>
          <AnalyticsDashboard
            startDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
            endDate={new Date()}
          />
        </section>

        {/* All time */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">All Time</h2>
          <AnalyticsDashboard />
        </section>
      </div>
    </div>
  )
}
```

---

## Summary

You now have three complementary analytics systems:

| Feature | Vercel | PostHog | MongoDB |
|---------|--------|---------|---------|
| Basic metrics | ✅ | ✅ | ✅ |
| User identification | ❌ | ✅ | ✅ |
| Custom events | ❌ | ✅ | ❌ |
| Time on page | ❌ | ✅ | ✅ |
| Own your data | ❌ | ❌ | ✅ |
| Session recordings | ❌ | ✅ | ❌ |
| Feature flags | ❌ | ✅ | ❌ |
| Works locally | ❌ | ✅ | ✅ |

**Recommendation:** Use all three!
- **Vercel** for quick overview
- **PostHog** for user behavior & experimentation
- **MongoDB** for custom queries & data ownership
