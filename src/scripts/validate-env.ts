#!/usr/bin/env node
/**
 * Environment validation script
 * Runs before build to ensure all required environment variables are present
 * Usage: tsx src/scripts/validate-env.ts
 */

// Load environment variables from .env file
import { config } from 'dotenv';
import { resolve } from 'path';

// Try to load .env file (for local development)
config({ path: resolve(process.cwd(), '.env') });

import { validateEnv } from '../lib/validation/env';

console.log('🔍 Validating environment variables...\n');

try {
  const env = validateEnv();
  
  console.log('✅ Environment validation passed!\n');
  console.log('Validated variables:');
  console.log(`  - DATABASE_URL: ${env.DATABASE_URL.substring(0, 30)}...`);
  console.log(`  - PAYLOAD_SECRET: ${env.PAYLOAD_SECRET.substring(0, 10)}... (${env.PAYLOAD_SECRET.length} chars)`);
  console.log(`  - OPENAI_API_KEY: ${env.OPENAI_API_KEY.substring(0, 10)}...`);
  console.log(`  - NEXT_PUBLIC_APP_URL: ${env.NEXT_PUBLIC_APP_URL}`);
  console.log(`  - NODE_ENV: ${env.NODE_ENV}`);
  
  if (env.UPSTASH_REDIS_REST_URL) {
    console.log(`  - UPSTASH_REDIS_REST_URL: ${env.UPSTASH_REDIS_REST_URL.substring(0, 30)}...`);
  } else {
    console.log('  ⚠️  UPSTASH_REDIS_REST_URL: Not set (using in-memory fallback)');
  }
  
  console.log('\n✨ Ready to build!\n');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Environment validation failed!\n');
  
  if (error instanceof Error) {
    console.error(error.message);
  }
  
  console.error('\n📝 Please check your .env file and ensure all required variables are set.');
  console.error('📖 See .env.example for reference.\n');
  
  process.exit(1);
}
