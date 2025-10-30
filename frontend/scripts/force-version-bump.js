#!/usr/bin/env node

/**
 * Force Version Bump Script
 * 
 * This script forces a version bump and updates the build date.
 * Run this manually if you need to force users to clear their cache.
 * 
 * Usage: node scripts/force-version-bump.js
 */

const fs = require('fs');
const path = require('path');

const publicVersionPath = path.join(__dirname, '../public/version.json');
const repoVersionPath = path.join(__dirname, '../version.json');
const versionSourcePath = fs.existsSync(publicVersionPath) ? publicVersionPath : repoVersionPath;

try {
  // Read current version
  const versionData = JSON.parse(fs.readFileSync(versionSourcePath, 'utf8'));
  
  console.log('Current version:', versionData);
  
  // Parse version number
  const [major, minor, patch] = versionData.version.split('.').map(Number);
  
  // Bump patch version
  const newVersion = `${major}.${minor}.${patch + 1}`;
  
  // Update version data
  const newVersionData = {
    version: newVersion,
    buildDate: new Date().toISOString()
  };
  
  // Write new version
  fs.writeFileSync(publicVersionPath, JSON.stringify(newVersionData, null, 2) + '\n');

  if (fs.existsSync(repoVersionPath)) {
    fs.writeFileSync(repoVersionPath, JSON.stringify(newVersionData, null, 2) + '\n');
  }
  
  console.log('✅ Version bumped to:', newVersion);
  console.log('📅 Build date:', newVersionData.buildDate);
  console.log('');
  console.log('🔄 This will force all users to clear their cache on next visit.');
  console.log('💾 Version file updated at:', publicVersionPath);
  
} catch (error) {
  console.error('❌ Error bumping version:', error.message);
  process.exit(1);
}
