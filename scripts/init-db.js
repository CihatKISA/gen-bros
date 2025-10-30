#!/usr/bin/env node

// Simple script to initialize database by answering Drizzle's interactive question
const { spawn } = require('child_process');

console.log('Initializing database...');

const child = spawn('npm', ['run', 'dev'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env }
});

let output = '';

child.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  console.log(text);
  
  // Check if Drizzle is asking about enum creation
  if (text.includes('Is enum_users_role enum created or renamed from another enum?')) {
    console.log('Answering Drizzle question automatically...');
    // Send "+" to select "create enum"
    child.stdin.write('\n');
  }
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});

// Auto-exit after 30 seconds
setTimeout(() => {
  console.log('Auto-stopping after 30 seconds...');
  child.kill();
  process.exit(0);
}, 30000);