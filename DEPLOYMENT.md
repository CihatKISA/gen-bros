# Deployment Guide

This guide walks you through deploying the AI Content Topic Generator to Vercel with Neon PostgreSQL.

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Neon account (sign up at https://neon.tech)
- OpenAI API key (get from https://platform.openai.com/api-keys)
- Upstash Redis account (optional, sign up at https://upstash.com)

## Step 1: Set Up Neon PostgreSQL Database

1. **Create a Neon Project**
   - Go to https://console.neon.tech
   - Click "Create Project"
   - Choose a project name (e.g., "ai-topic-generator")
   - Select a region close to your users
   - Click "Create Project"

2. **Get Database Connection String**
   - In your Neon project dashboard, click "Connection Details"
   - Copy the connection string (it should look like):
     ```
     postgresql://[user]:[password]@[host]/[database]?sslmode=require
     ```
   - Save this for later - you'll need it for Vercel environment variables

3. **Note About Database Migrations**
   - Payload CMS will automatically create tables on first run
   - No manual migration needed
   - The seed script will populate initial data

## Step 2: Prepare Your Repository

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Verify .gitignore**
   - Ensure `.env` is in `.gitignore`
   - Never commit sensitive credentials

## Step 3: Deploy to Vercel

1. **Import Project**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Import"

2. **Configure Project**
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (auto-configured)
   - Output Directory: `.next` (auto-configured)

3. **Add Environment Variables**
   
   Click "Environment Variables" and add the following:

   **Required Variables:**
   
   | Name | Value | Notes |
   |------|-------|-------|
   | `DATABASE_URL` | Your Neon connection string | From Step 1 |
   | `PAYLOAD_SECRET` | Generate a secure key | Run `openssl rand -base64 32` |
   | `OPENAI_API_KEY` | Your OpenAI API key | From https://platform.openai.com |
   | `NEXT_PUBLIC_APP_URL` | Your Vercel domain | e.g., `https://your-app.vercel.app` |
   | `NODE_ENV` | `production` | Set to production |

   **Optional Variables (Recommended):**
   
   | Name | Value | Notes |
   |------|-------|-------|
   | `UPSTASH_REDIS_REST_URL` | Your Upstash Redis URL | For rate limiting |
   | `UPSTASH_REDIS_REST_TOKEN` | Your Upstash token | For rate limiting |
   | `PAYLOAD_PUBLIC_SERVER_URL` | Same as `NEXT_PUBLIC_APP_URL` | Optional |

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (2-5 minutes)
   - Vercel will run environment validation before building

## Step 4: Post-Deployment Setup

1. **Verify Deployment**
   - Visit your Vercel URL
   - You should see the homepage

2. **Create Admin User**
   - Go to `https://your-app.vercel.app/admin`
   - Create your first admin user
   - This will be your main admin account

3. **Seed the Database**
   
   You have two options:

   **Option A: Run seed script locally (Recommended)**
   ```bash
   # Set DATABASE_URL to your Neon connection string
   export DATABASE_URL="your-neon-connection-string"
   npm run seed
   ```

   **Option B: Seed via Vercel CLI**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link to your project
   vercel link
   
   # Run seed command
   vercel env pull .env.production
   npm run seed
   ```

4. **Verify Seeded Data**
   - Login to admin panel: `https://your-app.vercel.app/admin`
   - Check "Tool Modules" - should see "Topic Generator"
   - Check "Categories" - should see 10 default categories

## Step 5: Configure Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL` to your custom domain
   - Update `PAYLOAD_PUBLIC_SERVER_URL` to match
   - Redeploy for changes to take effect

## Step 6: Set Up Upstash Redis (Optional but Recommended)

Redis provides better rate limiting and caching. Without it, the app uses in-memory fallback.

1. **Create Upstash Database**
   - Go to https://console.upstash.com
   - Click "Create Database"
   - Choose a name and region
   - Select "Global" for best performance

2. **Get Credentials**
   - In your database dashboard, find "REST API"
   - Copy `UPSTASH_REDIS_REST_URL`
   - Copy `UPSTASH_REDIS_REST_TOKEN`

3. **Add to Vercel**
   - Go to Vercel project settings
   - Add the two environment variables
   - Redeploy

## Environment Variables Reference

### Required for Production

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Payload CMS
PAYLOAD_SECRET=your-32-char-secret-key-here
PAYLOAD_PUBLIC_SERVER_URL=https://your-app.vercel.app

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Optional but Recommended

```bash
# Redis (for better rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

## Troubleshooting

### Build Fails with Environment Validation Error

**Problem:** Build fails with "Missing or invalid environment variables"

**Solution:**
1. Check all required variables are set in Vercel
2. Ensure `DATABASE_URL` is a valid PostgreSQL connection string
3. Ensure `PAYLOAD_SECRET` is at least 32 characters
4. Ensure `OPENAI_API_KEY` starts with `sk-`

### Database Connection Fails

**Problem:** App can't connect to Neon database

**Solution:**
1. Verify `DATABASE_URL` includes `?sslmode=require`
2. Check Neon project is active (not suspended)
3. Verify connection string is correct
4. Check Neon dashboard for connection errors

### OpenAI API Errors

**Problem:** Topic generation fails with API errors

**Solution:**
1. Verify `OPENAI_API_KEY` is valid
2. Check OpenAI account has credits
3. Check API key has correct permissions
4. Review OpenAI usage limits

### Rate Limiting Not Working

**Problem:** Users can make unlimited requests

**Solution:**
1. Add Upstash Redis credentials
2. Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Check Upstash dashboard for connection errors
4. Without Redis, in-memory fallback is used (resets on deployment)

### Admin Panel Not Accessible

**Problem:** Can't access `/admin` route

**Solution:**
1. Clear browser cache and cookies
2. Try incognito/private browsing mode
3. Check browser console for errors
4. Verify Payload CMS is properly configured

## Monitoring and Maintenance

### Check Application Health

1. **Vercel Dashboard**
   - Monitor deployment status
   - Check function logs
   - Review analytics

2. **Neon Dashboard**
   - Monitor database usage
   - Check connection count
   - Review query performance

3. **OpenAI Dashboard**
   - Monitor API usage
   - Check token consumption
   - Review costs

### Update Environment Variables

1. Go to Vercel project settings
2. Click "Environment Variables"
3. Update the variable
4. Redeploy for changes to take effect

### Redeploy Application

```bash
# Trigger redeployment
git commit --allow-empty -m "Trigger redeploy"
git push
```

Or use Vercel dashboard:
1. Go to "Deployments"
2. Click "..." on latest deployment
3. Click "Redeploy"

## Security Best Practices

1. **Rotate Secrets Regularly**
   - Change `PAYLOAD_SECRET` every 90 days
   - Rotate API keys periodically

2. **Monitor API Usage**
   - Set up OpenAI usage alerts
   - Monitor for unusual patterns

3. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm update
   ```

4. **Enable Vercel Security Features**
   - Enable DDoS protection
   - Configure rate limiting
   - Set up monitoring alerts

## Cost Optimization

### Neon PostgreSQL
- Free tier: 0.5 GB storage, 1 compute unit
- Upgrade if you exceed limits
- Monitor usage in dashboard

### OpenAI API
- GPT-4o-mini is cost-effective
- Monitor token usage
- Set usage limits in OpenAI dashboard

### Upstash Redis
- Free tier: 10,000 commands/day
- Upgrade if needed
- Monitor usage in dashboard

### Vercel
- Free tier: 100 GB bandwidth, 100 GB-hours compute
- Monitor usage in dashboard
- Upgrade to Pro if needed

## Support

- **Vercel Support**: https://vercel.com/support
- **Neon Support**: https://neon.tech/docs
- **OpenAI Support**: https://help.openai.com
- **Project Issues**: [Your GitHub Issues URL]

## Next Steps

After successful deployment:

1. ✅ Test topic generation functionality
2. ✅ Create test user accounts
3. ✅ Verify rate limiting works
4. ✅ Test save/delete functionality
5. ✅ Monitor initial usage
6. ✅ Set up monitoring alerts
7. ✅ Share with users!

---

**Congratulations!** Your AI Content Topic Generator is now live! 🎉
