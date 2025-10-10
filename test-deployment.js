#!/usr/bin/env node

/**
 * GitHub to Netlify Deployment Test Script
 * This script helps verify that the deployment pipeline is working correctly
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 Testing GitHub to Netlify Deployment Pipeline...\n');

// Test 1: Check if build files exist
console.log('1. Checking build configuration...');
const netlifyToml = fs.existsSync('netlify.toml');
const packageJson = fs.existsSync('package.json');
const viteConfig = fs.existsSync('vite.config.js');

console.log(`   ✅ netlify.toml: ${netlifyToml ? 'Found' : 'Missing'}`);
console.log(`   ✅ package.json: ${packageJson ? 'Found' : 'Missing'}`);
console.log(`   ✅ vite.config.js: ${viteConfig ? 'Found' : 'Missing'}`);

// Test 2: Check build script
let hasBuildScript = false;
if (packageJson) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  hasBuildScript = pkg.scripts && pkg.scripts.build;
  console.log(`   ✅ Build script: ${hasBuildScript ? 'Configured' : 'Missing'}`);
  if (hasBuildScript) {
    console.log(`      Command: ${pkg.scripts.build}`);
  }
}

// Test 3: Check if dist directory exists (after build)
console.log('\n2. Checking build output...');
const distExists = fs.existsSync('dist');
const indexHtmlExists = fs.existsSync('dist/index.html');

console.log(`   ✅ dist/ directory: ${distExists ? 'Found' : 'Not built yet'}`);
console.log(`   ✅ dist/index.html: ${indexHtmlExists ? 'Found' : 'Missing'}`);

// Test 4: Check for test indicators
console.log('\n3. Checking test indicators...');
const homeJsx = fs.readFileSync('src/pages/Home.jsx', 'utf8');
const hasTestIndicator = homeJsx.includes('GitHub to Netlify Test');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const hasTestTitle = indexHtml.includes('GitHub Test');

console.log(`   ✅ Test indicator in Home.jsx: ${hasTestIndicator ? 'Found' : 'Missing'}`);
console.log(`   ✅ Test title in index.html: ${hasTestTitle ? 'Found' : 'Missing'}`);

// Test 5: Check redirects
console.log('\n4. Checking redirects configuration...');
const redirectsExists = fs.existsSync('public/_redirects');
const netlifyRedirects = netlifyToml ? fs.readFileSync('netlify.toml', 'utf8').includes('redirects') : false;

console.log(`   ✅ public/_redirects: ${redirectsExists ? 'Found' : 'Missing'}`);
console.log(`   ✅ netlify.toml redirects: ${netlifyRedirects ? 'Configured' : 'Missing'}`);

// Summary
console.log('\n📋 Deployment Test Summary:');
console.log('============================');

const allChecks = [
  netlifyToml,
  packageJson,
  viteConfig,
  hasBuildScript,
  hasTestIndicator,
  hasTestTitle,
  redirectsExists || netlifyRedirects
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 All checks passed! Your GitHub to Netlify deployment should work correctly.');
  console.log('\nNext steps:');
  console.log('1. Commit and push these changes to GitHub');
  console.log('2. Check your Netlify dashboard for deployment status');
  console.log('3. Visit your deployed site to see the test indicator');
} else {
  console.log('\n⚠️  Some checks failed. Please review the issues above.');
}

console.log('\n🔗 Useful commands:');
console.log('   npm run build     - Build the project locally');
console.log('   npm run preview   - Preview the built project');
console.log('   git add .         - Stage changes');
console.log('   git commit -m "Test deployment" - Commit changes');
console.log('   git push          - Push to GitHub');
