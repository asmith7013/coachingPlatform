# GitHub Actions Setup Checklist

Follow these steps in order to set up automated scraping:

## ☐ Step 1: Generate API Key

```bash
# Run this command to generate a secure API key:
openssl rand -hex 32
```

Copy the output - you'll need it for the next steps.

## ☐ Step 2: Add GitHub Secrets

Go to: **Repository → Settings → Secrets and variables → Actions**

Add these 4 secrets:

- [ ] `SCRAPER_API_KEY` = (the key you just generated)
- [ ] `ROADMAPS_USERNAME` = (your Roadmaps username)
- [ ] `ROADMAPS_PASSWORD` = (your Roadmaps password)
- [ ] `VERCEL_DEPLOYMENT_URL` = `https://ai-coaching-platform.vercel.app` (or your custom domain)

## ☐ Step 3: Add API Key to Vercel

Go to: **Vercel Dashboard → Project → Settings → Environment Variables**

Add this variable to **all environments** (Production, Preview, Development):

- [ ] **Key**: `SCRAPER_API_KEY`
- [ ] **Value**: (same key from Step 1)

## ☐ Step 4: Redeploy on Vercel

After adding the environment variable:

- [ ] Go to **Deployments** tab
- [ ] Click **"..."** on latest deployment
- [ ] Click **"Redeploy"**
- [ ] Wait for deployment to complete

## ☐ Step 5: Test Manually

Go to: **Repository → Actions → Scrape Roadmaps Daily**

- [ ] Click **"Run workflow"**
- [ ] Leave default batch size (10)
- [ ] Click green **"Run workflow"** button
- [ ] Watch the run and verify it completes successfully

## ☐ Step 6: Verify Results

- [ ] Check MongoDB to confirm data was scraped
- [ ] Check Vercel function logs for any errors
- [ ] Review GitHub Actions logs for the run

---

## 🎉 You're Done!

The scraper will now run automatically every day at 2 AM UTC.

You can trigger it manually anytime from the Actions tab.

---

## Quick Links

- **GitHub Actions**: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Full Setup Guide**: [README.md](./README.md)
