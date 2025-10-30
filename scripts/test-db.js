require('dotenv').config();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not found');
    }
    
    if (!process.env.PAYLOAD_SECRET) {
      throw new Error('PAYLOAD_SECRET not found');
    }
    
    console.log('✓ Environment variables OK');
    console.log('✓ DATABASE_URL:', process.env.DATABASE_URL.substring(0, 50) + '...');
    console.log('✓ PAYLOAD_SECRET length:', process.env.PAYLOAD_SECRET.length);
    
    // Test Payload initialization
    const { getPayload } = await import('payload');
    const config = await import('../src/payload/payload.config.ts');
    
    console.log('Initializing Payload...');
    const payload = await getPayload({ config: config.default });
    
    console.log('✓ Payload initialized successfully');
    
    // Test simple query
    const result = await payload.find({
      collection: 'users',
      limit: 1,
    });
    
    console.log('✓ Database query successful');
    console.log('Users found:', result.totalDocs);
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();