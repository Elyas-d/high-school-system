#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

console.log('🧪 Setting up E2E Test Environment...');

async function runTests() {
  try {
    // Check if test database is accessible
    console.log('📊 Checking test database connection...');
    
    // Run database migrations for test environment
    console.log('🔄 Running database migrations...');
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env['DATABASE_URL'] },
      stdio: 'inherit',
    });

    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', {
      stdio: 'inherit',
    });

    // Run E2E tests
    console.log('🚀 Running E2E tests...');
    execSync('npm run test:e2e', {
      stdio: 'inherit',
    });

    console.log('✅ E2E tests completed successfully!');
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests(); 