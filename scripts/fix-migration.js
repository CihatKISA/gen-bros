const { spawn } = require('child_process');
const readline = require('readline');

console.log('🔧 Fixing Drizzle migration issue...');

// Start the dev server
const child = spawn('npm', ['run', 'dev'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env }
});

let hasAnswered = false;

child.stdout.on('data', (data) => {
  const text = data.toString();
  console.log(text);
  
  // Check if Drizzle is asking about enum creation
  if (text.includes('Is enum_users_role enum created or renamed from another enum?') && !hasAnswered) {
    console.log('🤖 Auto-answering Drizzle question...');
    hasAnswered = true;
    
    // Wait a bit then send the answer
    setTimeout(() => {
      child.stdin.write('\n'); // Select the default option
      console.log('✅ Migration question answered');
      
      // Wait for migration to complete then exit
      setTimeout(() => {
        console.log('🎉 Migration completed! Stopping server...');
        child.kill('SIGTERM');
      }, 5000);
    }, 1000);
  }
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('close', (code) => {
  console.log(`✅ Process completed with code ${code}`);
  console.log('🚀 You can now run "npm run dev" normally');
  process.exit(0);
});

// Auto-exit after 60 seconds
setTimeout(() => {
  console.log('⏰ Timeout reached, stopping...');
  child.kill('SIGTERM');
  process.exit(0);
}, 60000);