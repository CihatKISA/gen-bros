# Database Seeding Scripts

This directory contains scripts for seeding the database with initial data.

## Overview

The seeding process populates your database with essential data needed for the application to function properly. This includes tool modules, categories, and other foundational data.

## Available Scripts

### `seed.ts`

The main seeding script that populates the database with initial data.

**What it creates:**

1. **Topic Generator Tool Module**
   - Slug: `topic-generator`
   - Rate limits: 10 requests/hour, 50 requests/day
   - AI model configuration: GPT-4o-mini
   - Status: Enabled by default

2. **Default Categories** (10 categories)
   - Digital Marketing
   - Technology
   - Health & Fitness
   - Business
   - Education
   - Entertainment
   - Finance
   - Travel
   - Food & Cooking
   - Fashion & Beauty

## Usage

### Running the Seed Script

From the project root:

```bash
npm run seed
```

Or directly with tsx:

```bash
npx tsx src/scripts/seed.ts
```

### Prerequisites

Before running the seed script, ensure:

1. ✅ Database is created and accessible
2. ✅ `DATABASE_URL` is set in your `.env` file
3. ✅ `PAYLOAD_SECRET` is set in your `.env` file
4. ✅ Database migrations have been run (Payload handles this automatically on first run)

### Expected Output

```
Starting database seed...
Creating Topic Generator tool module...
✓ Topic Generator tool module created
Creating default categories...
  ✓ Created category: Digital Marketing
  ✓ Created category: Technology
  ✓ Created category: Health & Fitness
  ✓ Created category: Business
  ✓ Created category: Education
  ✓ Created category: Entertainment
  ✓ Created category: Finance
  ✓ Created category: Travel
  ✓ Created category: Food & Cooking
  ✓ Created category: Fashion & Beauty

✓ Categories: 10 created, 0 already existed

✅ Database seed completed successfully!

You can now:
  1. Start the development server: npm run dev
  2. Access the admin panel: http://localhost:3000/admin
  3. Create an admin user to manage the system
```

## Idempotency

The seed script is **idempotent**, meaning:
- It checks for existing data before creating new records
- You can safely run it multiple times
- It will skip records that already exist
- It will only create missing data

This makes it safe to use in:
- Development environments (can be run repeatedly)
- CI/CD pipelines (won't fail if data exists)
- Production deployments (safe initial setup)

## Troubleshooting

### Error: "DATABASE_URL is not defined"

**Solution:** Ensure your `.env` file contains a valid `DATABASE_URL`:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Error: "PAYLOAD_SECRET is not defined"

**Solution:** Add a secure secret to your `.env` file:

```bash
PAYLOAD_SECRET=your-secret-key-min-32-characters-long-here
```

### Error: "Connection refused"

**Solution:** 
1. Verify your database is running
2. Check your database connection string
3. Ensure your database accepts connections from your IP

### Error: "Seed failed: relation does not exist"

**Solution:** 
1. Stop the seed script
2. Start the Next.js dev server: `npm run dev`
3. Visit `http://localhost:3000/admin` to trigger Payload migrations
4. Stop the dev server
5. Run the seed script again: `npm run seed`

## Customization

### Adding More Categories

Edit `src/scripts/seed.ts` and add to the `categories` array:

```typescript
const categories = [
  // ... existing categories
  {
    name: 'Your Category',
    slug: 'your-category',
    description: 'Description of your category',
    icon: 'icon-name',
    order: 11,
  },
]
```

### Modifying Rate Limits

Edit the tool module creation in `src/scripts/seed.ts`:

```typescript
rateLimits: {
  requestsPerHour: 20,  // Change this
  requestsPerDay: 100,  // Change this
},
```

### Adding More Tool Modules

Add additional tool module creation blocks in `src/scripts/seed.ts`:

```typescript
await payload.create({
  collection: 'tool-modules',
  data: {
    name: 'Your Tool Name',
    slug: 'your-tool-slug',
    description: 'Tool description',
    enabled: true,
    rateLimits: {
      requestsPerHour: 10,
      requestsPerDay: 50,
    },
  },
})
```

## Best Practices

1. **Always run seed after database reset**: If you drop and recreate your database, run the seed script to restore initial data

2. **Version control**: Keep the seed script in version control so all team members have the same initial data

3. **Environment-specific data**: For production, consider creating a separate seed script with production-appropriate data

4. **Test data**: For development, you might want to create additional seed scripts for test users and sample data

## Production Deployment

When deploying to production:

1. Ensure environment variables are set in your hosting platform
2. Run the seed script as part of your deployment process:
   ```bash
   npm run seed
   ```
3. The script will only create data if it doesn't exist, making it safe for production

### Vercel Deployment

For Vercel, you can add a post-build script in `package.json`:

```json
{
  "scripts": {
    "postbuild": "npm run seed"
  }
}
```

Or run it manually after deployment:

```bash
vercel env pull .env.local
npm run seed
```

## Related Files

- `src/payload/collections/ToolModules.ts` - Tool module collection schema
- `src/payload/collections/Categories.ts` - Categories collection schema
- `src/payload/payload.config.ts` - Payload CMS configuration
- `package.json` - Contains the `seed` script definition

## Support

If you encounter issues with the seed script:

1. Check the console output for specific error messages
2. Verify your environment variables are correct
3. Ensure your database is accessible
4. Check the Payload CMS documentation: https://payloadcms.com/docs
5. Review the troubleshooting section above
