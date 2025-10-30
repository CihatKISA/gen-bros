// Load environment variables FIRST before any other imports
import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'
dotenvConfig({ path: resolve(process.cwd(), '.env') })

// Now import Payload after environment is loaded
import { getPayload } from 'payload'
import config from '../payload/payload.config'

/**
 * Database seeding script for initial data
 * 
 * This script populates the database with:
 * - Default tool module (Topic Generator)
 * - Default categories for content generation
 * 
 * Run with: npm run seed
 * 
 * Note: If you encounter "missing secret key" error, you can seed via the admin panel:
 * 1. Start dev server: npm run dev
 * 2. Go to http://localhost:3000/admin
 * 3. Manually create tool modules and categories
 * 
 * Or run this script after the dev server has initialized Payload once.
 */

async function seed() {
  console.log('Starting database seed...')
  
  // Validate required environment variables
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file')
    process.exit(1)
  }
  
  if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 32) {
    console.error('❌ PAYLOAD_SECRET is not set or is too short (must be at least 32 characters)')
    console.error('Generate one with: openssl rand -base64 32')
    process.exit(1)
  }
  
  console.log('✓ Environment variables validated')

  try {
    const payload = await getPayload({ config })

    // Check if tool module already exists
    const existingTool = await payload.find({
      collection: 'tool-modules',
      where: {
        slug: {
          equals: 'topic-generator',
        },
      },
      limit: 1,
    })

    // Create default tool module if it doesn't exist
    if (existingTool.docs.length === 0) {
      console.log('Creating Topic Generator tool module...')
      await payload.create({
        collection: 'tool-modules',
        data: {
          name: 'Topic Generator',
          slug: 'topic-generator',
          description: 'Generate engaging social media content topics using AI. Perfect for content creators, marketers, and social media managers looking for fresh ideas.',
          icon: 'lightbulb',
          enabled: true,
          config: {
            model: 'gpt-4o-mini',
            maxTokens: 2000,
            temperature: 0.7,
          },
          rateLimits: {
            requestsPerHour: 10,
            requestsPerDay: 50,
          },
        },
      })
      console.log('✓ Topic Generator tool module created')
    } else {
      console.log('✓ Topic Generator tool module already exists')
    }

    // Define default categories
    const categories = [
      {
        name: 'Digital Marketing',
        slug: 'digital-marketing',
        description: 'Content ideas for digital marketing, SEO, social media marketing, and online advertising',
        icon: 'megaphone',
        order: 1,
      },
      {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech trends, software development, AI, gadgets, and innovation topics',
        icon: 'cpu',
        order: 2,
      },
      {
        name: 'Health & Fitness',
        slug: 'health-fitness',
        description: 'Wellness, exercise, nutrition, mental health, and lifestyle content',
        icon: 'heart',
        order: 3,
      },
      {
        name: 'Business',
        slug: 'business',
        description: 'Entrepreneurship, leadership, productivity, and business strategy',
        icon: 'briefcase',
        order: 4,
      },
      {
        name: 'Education',
        slug: 'education',
        description: 'Learning, teaching, online courses, and educational resources',
        icon: 'book',
        order: 5,
      },
      {
        name: 'Entertainment',
        slug: 'entertainment',
        description: 'Movies, music, gaming, pop culture, and entertainment news',
        icon: 'film',
        order: 6,
      },
      {
        name: 'Finance',
        slug: 'finance',
        description: 'Personal finance, investing, cryptocurrency, and money management',
        icon: 'dollar-sign',
        order: 7,
      },
      {
        name: 'Travel',
        slug: 'travel',
        description: 'Travel tips, destinations, adventure, and tourism content',
        icon: 'plane',
        order: 8,
      },
      {
        name: 'Food & Cooking',
        slug: 'food-cooking',
        description: 'Recipes, cooking tips, restaurants, and culinary experiences',
        icon: 'utensils',
        order: 9,
      },
      {
        name: 'Fashion & Beauty',
        slug: 'fashion-beauty',
        description: 'Style trends, beauty tips, skincare, and fashion advice',
        icon: 'sparkles',
        order: 10,
      },
    ]

    // Create categories
    console.log('Creating default categories...')
    let createdCount = 0
    let skippedCount = 0

    for (const category of categories) {
      const existing = await payload.find({
        collection: 'categories',
        where: {
          slug: {
            equals: category.slug,
          },
        },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'categories',
          data: category,
        })
        createdCount++
        console.log(`  ✓ Created category: ${category.name}`)
      } else {
        skippedCount++
        console.log(`  - Skipped existing category: ${category.name}`)
      }
    }

    console.log(`\n✓ Categories: ${createdCount} created, ${skippedCount} already existed`)
    console.log('\n✅ Database seed completed successfully!')
    console.log('\nYou can now:')
    console.log('  1. Start the development server: npm run dev')
    console.log('  2. Access the admin panel: http://localhost:3000/admin')
    console.log('  3. Create an admin user to manage the system')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

// Run the seed function
seed()
