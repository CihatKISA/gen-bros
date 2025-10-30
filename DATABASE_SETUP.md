# Database Setup Guide

This guide covers setting up and managing the Neon PostgreSQL database for the AI Content Topic Generator.

## Table of Contents

- [Initial Setup](#initial-setup)
- [Database Schema](#database-schema)
- [Migrations](#migrations)
- [Seeding](#seeding)
- [Backup and Restore](#backup-and-restore)
- [Troubleshooting](#troubleshooting)

## Initial Setup

### Option 1: Neon PostgreSQL (Recommended for Production)

1. **Create Neon Account**
   - Go to https://neon.tech
   - Sign up for a free account
   - Verify your email

2. **Create a New Project**
   - Click "Create Project"
   - Project name: `ai-topic-generator` (or your choice)
   - Region: Choose closest to your users
     - US East (N. Virginia) - `us-east-1`
     - EU (Frankfurt) - `eu-central-1`
     - Asia Pacific (Singapore) - `ap-southeast-1`
   - PostgreSQL version: 16 (latest)
   - Click "Create Project"

3. **Get Connection String**
   - In project dashboard, click "Connection Details"
   - Select "Pooled connection" (recommended for serverless)
   - Copy the connection string:
     ```
     postgresql://[user]:[password]@[host]/[database]?sslmode=require
     ```
   - Save this securely - you'll need it for `.env`

4. **Configure Environment**
   ```bash
   # Add to .env
   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
   ```

### Option 2: Local PostgreSQL (Development)

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql@16
   brew services start postgresql@16

   # Ubuntu/Debian
   sudo apt-get install postgresql-16
   sudo systemctl start postgresql

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql postgres

   # Create database
   CREATE DATABASE ai_topic_generator;

   # Create user (optional)
   CREATE USER myuser WITH PASSWORD 'mypassword';
   GRANT ALL PRIVILEGES ON DATABASE ai_topic_generator TO myuser;

   # Exit
   \q
   ```

3. **Configure Environment**
   ```bash
   # Add to .env
   DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/ai_topic_generator"
   ```

## Database Schema

The application uses Payload CMS which automatically manages the database schema. Tables are created on first run.

### Collections (Tables)

#### 1. Users
Stores user accounts and authentication data.

**Fields:**
- `id` - UUID primary key
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `role` - User role (user, admin)
- `firstName` - Optional first name
- `lastName` - Optional last name
- `preferences` - JSON (theme, notifications)
- `usageStats` - JSON (generation count, last generation)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

**Indexes:**
- Primary key on `id`
- Unique index on `email`
- Index on `role`

#### 2. SavedTopics
Stores user-saved topic suggestions.

**Fields:**
- `id` - UUID primary key
- `user` - Foreign key to Users
- `tool` - Foreign key to ToolModules
- `category` - Foreign key to Categories (optional)
- `title` - Topic title
- `content` - JSON (full topic data)
- `input` - JSON (original input)
- `metadata` - JSON (tokens, model, processing time)
- `tags` - Array of strings
- `isFavorite` - Boolean
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

**Indexes:**
- Primary key on `id`
- Index on `(user, createdAt DESC)`
- Index on `(tool, user)`
- Index on `category`
- Index on `(user, isFavorite)` where `isFavorite = true`

#### 3. ToolModules
Stores configuration for AI tools.

**Fields:**
- `id` - UUID primary key
- `name` - Tool name
- `slug` - Unique URL-friendly identifier
- `description` - Tool description
- `icon` - Icon identifier
- `enabled` - Boolean
- `config` - JSON (tool-specific settings)
- `rateLimits` - JSON (requests per hour/day)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

**Indexes:**
- Primary key on `id`
- Unique index on `slug`
- Index on `enabled` where `enabled = true`

#### 4. Categories
Stores content categories with hierarchical structure.

**Fields:**
- `id` - UUID primary key
- `name` - Category name
- `slug` - Unique URL-friendly identifier
- `description` - Category description
- `parent` - Foreign key to Categories (self-referential)
- `icon` - Icon identifier
- `order` - Sort order
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

**Indexes:**
- Primary key on `id`
- Unique index on `slug`
- Index on `parent`

### Relationships

```
Users (1) ──────< (N) SavedTopics
ToolModules (1) ─< (N) SavedTopics
Categories (1) ──< (N) SavedTopics
Categories (1) ──< (N) Categories (hierarchical)
```

## Migrations

Payload CMS handles migrations automatically. No manual migration files needed.

### How It Works

1. **First Run**: Payload creates all tables based on collection definitions
2. **Schema Changes**: Payload detects changes and updates tables
3. **Safe Updates**: Payload preserves existing data during updates

### Manual Migration (if needed)

If you need to run manual SQL:

```bash
# Connect to database
psql $DATABASE_URL

# Run your SQL
-- Your migration SQL here

# Exit
\q
```

### Verify Schema

```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Describe a table
\d users

# Exit
\q
```

## Seeding

The seed script populates the database with initial data.

### What Gets Seeded

1. **Topic Generator Tool Module**
   - Pre-configured with rate limits
   - Ready to use immediately

2. **Default Categories**
   - 10 popular content categories
   - Organized and ready for selection

### Running the Seed Script

```bash
# Ensure DATABASE_URL is set
npm run seed
```

**Note:** If you encounter a "missing secret key" error, this is due to ESM module loading order. You have two options:

**Option A: Seed via Admin Panel (Recommended)**
1. Start the development server: `npm run dev`
2. Go to `http://localhost:3000/admin`
3. Create an admin user
4. Manually add tool modules and categories through the admin UI

**Option B: Seed After First Run**
1. Start the dev server once: `npm run dev` (this initializes Payload)
2. Stop the server (Ctrl+C)
3. Run the seed script: `npm run seed`

### Seed Script Details

The script is **idempotent** - safe to run multiple times:
- Checks for existing data before creating
- Skips items that already exist
- Only creates missing items

### Custom Seeding

Edit `src/scripts/seed.ts` to customize:

```typescript
// Add more categories
const categories = [
  { name: 'Your Category', slug: 'your-category', description: '...' },
  // ... more categories
];

// Modify tool configuration
const toolModule = {
  name: 'Topic Generator',
  rateLimits: {
    requestsPerHour: 20, // Increase limit
    requestsPerDay: 100,
  },
};
```

### Verify Seeded Data

1. **Via Admin Panel**
   - Go to `http://localhost:3000/admin`
   - Check "Tool Modules" collection
   - Check "Categories" collection

2. **Via Database**
   ```bash
   psql $DATABASE_URL
   
   SELECT * FROM tool_modules;
   SELECT * FROM categories;
   
   \q
   ```

## Backup and Restore

### Backup Database

#### Neon PostgreSQL

1. **Via Neon Dashboard**
   - Go to your project
   - Click "Backups"
   - Neon automatically creates daily backups
   - Restore from any backup point

2. **Manual Backup**
   ```bash
   # Export to SQL file
   pg_dump $DATABASE_URL > backup.sql
   
   # Export specific tables
   pg_dump $DATABASE_URL -t users -t saved_topics > backup.sql
   ```

#### Local PostgreSQL

```bash
# Full backup
pg_dump ai_topic_generator > backup.sql

# Compressed backup
pg_dump ai_topic_generator | gzip > backup.sql.gz

# Backup with timestamp
pg_dump ai_topic_generator > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

#### From SQL File

```bash
# Restore full database
psql $DATABASE_URL < backup.sql

# Restore specific tables
psql $DATABASE_URL < backup.sql
```

#### From Neon Backup

1. Go to Neon dashboard
2. Click "Backups"
3. Select backup point
4. Click "Restore"
5. Choose restore options

### Automated Backups

#### Using Cron (Linux/macOS)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * pg_dump $DATABASE_URL | gzip > ~/backups/db_$(date +\%Y\%m\%d).sql.gz

# Keep only last 7 days
0 3 * * * find ~/backups -name "db_*.sql.gz" -mtime +7 -delete
```

## Troubleshooting

### Connection Issues

**Problem:** Can't connect to database

**Solutions:**
```bash
# Test connection
psql $DATABASE_URL

# Check if DATABASE_URL is set
echo $DATABASE_URL

# Verify SSL mode (required for Neon)
# URL should include: ?sslmode=require
```

### Migration Errors

**Problem:** Tables not created or schema mismatch

**Solutions:**
1. Delete `.next` folder and rebuild
   ```bash
   rm -rf .next
   npm run build
   ```

2. Check Payload logs for errors
   ```bash
   npm run dev
   # Look for Payload initialization logs
   ```

3. Manually verify tables
   ```bash
   psql $DATABASE_URL
   \dt
   ```

### Seed Script Fails

**Problem:** Seed script errors or doesn't create data

**Solutions:**
1. Check database connection
   ```bash
   psql $DATABASE_URL
   ```

2. Verify Payload is initialized
   ```bash
   npm run dev
   # Wait for "Payload initialized"
   # Then run seed in another terminal
   npm run seed
   ```

3. Check for existing data
   ```bash
   psql $DATABASE_URL
   SELECT * FROM tool_modules;
   SELECT * FROM categories;
   ```

### Performance Issues

**Problem:** Slow queries or high database load

**Solutions:**
1. Check indexes are created
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'saved_topics';
   ```

2. Analyze query performance
   ```sql
   EXPLAIN ANALYZE SELECT * FROM saved_topics WHERE user_id = 'xxx';
   ```

3. Monitor Neon dashboard
   - Check connection count
   - Review slow queries
   - Check compute usage

### Data Corruption

**Problem:** Invalid or corrupted data

**Solutions:**
1. Restore from backup
   ```bash
   psql $DATABASE_URL < backup.sql
   ```

2. Validate data integrity
   ```sql
   -- Check for orphaned records
   SELECT * FROM saved_topics 
   WHERE user_id NOT IN (SELECT id FROM users);
   ```

3. Re-run seed script
   ```bash
   npm run seed
   ```

## Database Maintenance

### Regular Tasks

1. **Monitor Usage**
   - Check Neon dashboard weekly
   - Review storage usage
   - Monitor connection count

2. **Backup Verification**
   - Test restore process monthly
   - Verify backup integrity

3. **Performance Tuning**
   - Review slow queries
   - Add indexes as needed
   - Optimize large tables

### Useful SQL Queries

```sql
-- Count records per table
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'saved_topics', COUNT(*) FROM saved_topics
UNION ALL
SELECT 'tool_modules', COUNT(*) FROM tool_modules
UNION ALL
SELECT 'categories', COUNT(*) FROM categories;

-- Find most active users
SELECT u.email, COUNT(st.id) as saved_count
FROM users u
LEFT JOIN saved_topics st ON u.id = st.user_id
GROUP BY u.id, u.email
ORDER BY saved_count DESC
LIMIT 10;

-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Security Best Practices

1. **Connection Security**
   - Always use SSL (`?sslmode=require`)
   - Never commit `DATABASE_URL` to git
   - Rotate credentials periodically

2. **Access Control**
   - Use least privilege principle
   - Create separate users for different environments
   - Limit connection pool size

3. **Data Protection**
   - Regular backups
   - Encrypt sensitive data
   - Implement data retention policies

## Resources

- **Neon Documentation**: https://neon.tech/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Payload CMS Database**: https://payloadcms.com/docs/database/overview

---

Need help? Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide or open an issue.
