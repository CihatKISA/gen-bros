const { spawn } = require('child_process');

console.log('🚀 Starting automatic database migration...');

const child = spawn('npm', ['run', 'dev'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env }
});

let step = 0;
const steps = [
  'enum_users_role',
  'payload_locked_documents_rels',
  'payload_preferences', 
  'payload_preferences_rels',
  'payload_migrations',
  'data_loss_warning'
];

child.stdout.on('data', (data) => {
  const text = data.toString();
  console.log(text);
  
  // Handle enum question
  if (text.includes('Is enum_users_role enum created or renamed from another enum?')) {
    console.log('🤖 Selecting: create enum_users_role');
    child.stdin.write('\n'); // Select default (create enum)
    step++;
  }
  
  // Handle table creation questions
  else if (text.includes('Is payload_locked_documents_rels table created or renamed from another table?')) {
    console.log('🤖 Selecting: create payload_locked_documents_rels table');
    child.stdin.write('\n'); // Select default (create table)
    step++;
  }
  
  else if (text.includes('Is payload_preferences table created or renamed from another table?')) {
    console.log('🤖 Selecting: create payload_preferences table');
    child.stdin.write('\n'); // Select default (create table)
    step++;
  }
  
  else if (text.includes('Is payload_preferences_rels table created or renamed from another table?')) {
    console.log('🤖 Selecting: create payload_preferences_rels table');
    child.stdin.write('\n'); // Select default (create table)
    step++;
  }
  
  else if (text.includes('Is payload_migrations table created or renamed from another table?')) {
    console.log('🤖 Selecting: create payload_migrations table');
    child.stdin.write('\n'); // Select default (create table)
    step++;
  }
  
  // Handle data loss warning
  else if (text.includes('Accept warnings and push schema to database?')) {
    console.log('🤖 Accepting data loss warning (yes)');
    child.stdin.write('y\n'); // Accept data loss
    step++;
    
    // Wait for completion then exit
    setTimeout(() => {
      console.log('✅ Migration completed! Stopping server...');
      child.kill('SIGTERM');
    }, 3000);
  }
  
  // Check if server is ready (migration completed)
  else if (text.includes('Ready in') && step >= 5) {
    console.log('🎉 Server ready! Migration successful!');
    setTimeout(() => {
      child.kill('SIGTERM');
    }, 2000);
  }
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('close', (code) => {
  console.log(`✅ Migration process completed with code ${code}`);
  console.log('🚀 Database is now ready! You can run "npm run dev" normally.');
  process.exit(0);
});

// Safety timeout
setTimeout(() => {
  console.log('⏰ Timeout reached, stopping migration...');
  child.kill('SIGTERM');
  process.exit(0);
}, 120000); // 2 minutes timeout