/**
 * Development script for running client and server concurrently
 * This replaces concurrently to avoid util._extend deprecation warning
 */

import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const clientDir = join(rootDir, 'client');
const serverDir = join(rootDir, 'server');

console.log('🚀 Starting development servers...\n');

// Start client
const client = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: clientDir,
  shell: process.platform === 'win32',
});

// Start server
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: serverDir,
  shell: process.platform === 'win32',
});

// Handle process exit
const cleanup = () => {
  client.kill();
  server.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Handle client exit
client.on('error', (err) => {
  console.error('Client error:', err);
});

client.on('exit', (code) => {
  console.log(`Client exited with code ${code}`);
  cleanup();
});

// Handle server exit
server.on('error', (err) => {
  console.error('Server error:', err);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  cleanup();
});
