# GitHub Actions Setup for Roadmaps Scraper

This guide explains how to set up automated daily scraping of Roadmaps assessment data using GitHub Actions.

## Overview

The scraper runs daily at 2 AM UTC (9 PM EST / 6 PM PST) and can also be triggered manually. It calls your deployed Vercel API endpoint, which runs the Playwright scraper and saves data to MongoDB.

## Setup Instructions

### 1. Configure GitHub Secrets

Go to your GitHub repository settings and add these secrets:

**Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

#### `SCRAPER_API_KEY`
A secure random string to authenticate API requests.

Generate one with:
```bash
openssl rand -hex 32
```

Or use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Example: `a1b2c3d4e5f6...` (64 characters)

#### `ROADMAPS_EMAIL`
Your Teach to One Roadmaps email

Example: `your.email@example.com`

#### `ROADMAPS_PASSWORD`
Your Teach to One Roadmaps password

#### `VERCEL_DEPLOYMENT_URL` (Optional)
Your Vercel deployment URL

Example: `https://solvescoaching.com`

If not set, it will use the default URL from the workflow file.

### 2. Add SCRAPER_API_KEY to Vercel Environment Variables

The API endpoint needs to verify the API key. Add it to Vercel:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add new variable:
   - **Key**: `SCRAPER_API_KEY`
   - **Value**: (same value you used in GitHub secrets)
   - **Environment**: Production, Preview, Development

4. **Redeploy** your site for the environment variable to take effect

### 3. Enable GitHub Actions

GitHub Actions should be enabled by default, but verify:

1. Go to your repo → **Actions** tab
2. If disabled, click "I understand my workflows, go ahead and enable them"

### 4. Test the Setup

#### Manual Test via GitHub UI:

1. Go to **Actions** tab in your repo
2. Click **"Scrape Roadmaps Daily"** workflow
3. Click **"Run workflow"** dropdown
4. Click green **"Run workflow"** button
5. Watch the job run and check logs

#### Test via API directly:

```bash
curl -X POST https://your-domain.vercel.app/api/roadmaps/scrape \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "email": "your.email@example.com",
      "password": "yourpassword"
    }
  }'
```

## How It Works

### Workflow Triggers

1. **Scheduled**: Runs daily at 2 AM UTC automatically
2. **Manual**: Click "Run workflow" in GitHub Actions tab anytime

### What Happens

1. GitHub Actions spins up an Ubuntu container
2. Calls your Vercel API endpoint with credentials
3. Your API endpoint:
   - Verifies the API key
   - Launches Playwright browser
   - Scrapes Roadmaps data
   - Saves to MongoDB
4. Returns results to GitHub Actions
5. GitHub Actions logs show success/failure

### Security

- ✅ Credentials stored as encrypted GitHub Secrets
- ✅ API key required for endpoint access
- ✅ HTTPS for all communication
- ✅ Credentials never logged or exposed

## Monitoring

### Check Workflow Status

Go to **Actions** tab to see:
- ✅ Successful runs (green checkmark)
- ❌ Failed runs (red X)
- Click any run to see detailed logs

### Notifications

GitHub will email you if a workflow fails (check your GitHub notification settings).

## Troubleshooting

### "Invalid API key" error

- Make sure `SCRAPER_API_KEY` matches in both GitHub Secrets and Vercel Environment Variables
- Redeploy Vercel after adding environment variable

### 308 Redirect error

- The workflow now includes `-L` flag to follow redirects automatically
- If still occurring, verify `VERCEL_DEPLOYMENT_URL` uses `https://` (not `http://`)
- Example: `https://solvescoaching.com` (no trailing slash)

### "Missing credentials" error

- Verify `ROADMAPS_EMAIL` and `ROADMAPS_PASSWORD` are set in GitHub Secrets
- Check for typos in secret names

### Timeout errors

- Default timeout is 60 minutes
- If scraping takes longer, increase `timeout-minutes` in the workflow file

### Authentication failed

- Verify Roadmaps credentials are correct
- Try logging in manually at https://roadmaps.teachtoone.org/

## Customization

### Change Schedule

Edit `.github/workflows/scrape-roadmaps-daily.yml`:

```yaml
schedule:
  - cron: '0 2 * * *'  # Current: 2 AM UTC daily
```

Cron examples:
- `0 */6 * * *` - Every 6 hours
- `0 8 * * 1` - Every Monday at 8 AM
- `0 0 1 * *` - First day of each month

Use [crontab.guru](https://crontab.guru/) to build cron expressions.

### What Gets Scraped

The scraper runs all configured section combinations defined in `SCRAPER_SECTION_CONFIGS`. This ensures comprehensive data collection across all classes, roadmaps, and grade levels.

### Add Notifications

Add a step to send notifications on completion:

```yaml
- name: Send notification
  if: always()
  run: |
    # Add your notification logic here
    # e.g., Slack webhook, Discord, email, etc.
```

## Cost

✅ **GitHub Actions**: FREE
- 2,000 minutes/month for free (private repos)
- Unlimited for public repos
- Each run takes ~5-30 minutes depending on data

✅ **Vercel**: Works on free tier
- API endpoints are free
- Browser automation works on Vercel

## Support

If you encounter issues:

1. Check the Actions tab for detailed logs
2. Verify all secrets are set correctly
3. Test the API endpoint directly with curl
4. Check Vercel function logs
