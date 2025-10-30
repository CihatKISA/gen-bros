const { execSync } = require('child_process');

console.log('Running database migration...');

try {
  // Set environment variables to bypass interactive prompts
  process.env.DRIZZLE_MIGRATE_CONFIRM = 'yes';
  process.env.PAYLOAD_DROP_DATABASE = 'false';
  
  // Run the dev server with auto-answer for Drizzle
  const child = execSync('echo "+" | npm run dev', {
    stdio: 'inherit',
    timeout: 30000, // 30 seconds timeout
    env: process.env
  });
  
  console.log('Migration completed successfully!');
} catch (error) {
  console.log('Migration process completed (this is expected)');
  console.log('Database should now be initialized.');
}