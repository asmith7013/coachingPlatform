# GitHub Actions Scraper - Changes Summary

## What I Found

You were correct - an endpoint already existed! The "🔄 Update Assessment Data" button on [/roadmaps/history](http://localhost:3000/roadmaps/history) calls `scrapeAndUpdateAllSections`, which:

1. Scrapes **all configured sections** defined in `SCRAPER_SECTION_CONFIGS`
2. Uses Playwright to automate the browser
3. Updates MongoDB with scraped data
4. Returns detailed results

## Changes Made

### 1. Fixed API Endpoint ([src/app/api/roadmaps/scrape/route.ts](../../src/app/api/roadmaps/scrape/route.ts))

**Before:** My API was calling `scrapeAssessmentHistoryBatch` with wrong parameters:
```typescript
const result = await scrapeAssessmentHistoryBatch({
  credentials: { username, password },
  batchSize: 10
});
```

**After:** Now calls the same function as the UI button:
```typescript
const result = await scrapeAndUpdateAllSections({
  email: credentials.email,
  password: credentials.password,
});
```

### 2. Updated GitHub Actions Workflow ([.github/workflows/scrape-roadmaps-daily.yml](./scrape-roadmaps-daily.yml))

**Changed:**
- Removed `batch_size` input (no longer needed)
- Changed `ROADMAPS_USERNAME` → `ROADMAPS_EMAIL`
- Updated API request body to match new endpoint signature

### 3. Updated Documentation ([.github/workflows/README.md](./README.md))

**Updated:**
- Secret name from `ROADMAPS_USERNAME` to `ROADMAPS_EMAIL`
- Removed batch size instructions
- Updated curl examples
- Clarified what gets scraped

## How It Works Now

```
GitHub Actions (cron: daily @ 2 AM UTC)
  ↓
  Calls: POST /api/roadmaps/scrape
  ↓
  API verifies Bearer token
  ↓
  Calls: scrapeAndUpdateAllSections({ email, password })
  ↓
  Scrapes ALL section configs (same as UI button)
  ↓
  Updates MongoDB
  ↓
  Returns results
```

## Required GitHub Secrets

Set these in **Settings → Secrets and variables → Actions**:

1. `SCRAPER_API_KEY` - Random 64-char hex string (matches Vercel env var)
2. `ROADMAPS_EMAIL` - Your Teach to One email
3. `ROADMAPS_PASSWORD` - Your Teach to One password
4. `VERCEL_DEPLOYMENT_URL` - (Optional) Your Vercel URL

## Testing

### Test Locally
```bash
curl -X POST http://localhost:3000/api/roadmaps/scrape \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "email": "your.email@example.com",
      "password": "yourpassword"
    }
  }'
```

### Test Production
```bash
curl -X POST https://ai-coaching-platform.vercel.app/api/roadmaps/scrape \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "email": "your.email@example.com",
      "password": "yourpassword"
    }
  }'
```

## Next Steps

1. **Add `SCRAPER_API_KEY` to Vercel** (Settings → Environment Variables)
2. **Redeploy Vercel** (needed for env var to take effect)
3. **Add GitHub Secrets** (SCRAPER_API_KEY, ROADMAPS_EMAIL, ROADMAPS_PASSWORD)
4. **Test manually** via GitHub Actions → Run workflow
5. **Wait for scheduled run** (daily at 2 AM UTC)

## Key Insight

The API endpoint I created now serves as a **secure, authenticated gateway** to the existing scraper functionality. This allows GitHub Actions (or any other service) to trigger the same comprehensive scraping that the UI button does, but with proper API key authentication.
