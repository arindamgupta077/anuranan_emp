const fs = require('fs');
const path = require('path');

// Read current version
const publicVersionPath = path.join(__dirname, '..', 'public', 'version.json');
const repoVersionPath = path.join(__dirname, '..', 'version.json');
const versionSourcePath = fs.existsSync(publicVersionPath) ? publicVersionPath : repoVersionPath;
const versionData = JSON.parse(fs.readFileSync(versionSourcePath, 'utf8'));

// Parse version
const [major, minor, patch] = versionData.version.split('.').map(Number);

// Increment patch version
const newVersion = `${major}.${minor}.${patch + 1}`;

// Update version data
const newVersionData = {
  version: newVersion,
  buildDate: new Date().toISOString()
};

// Write new version to public file
fs.writeFileSync(publicVersionPath, JSON.stringify(newVersionData, null, 2) + '\n');

// Keep repository root copy in sync if it exists
if (fs.existsSync(repoVersionPath)) {
  fs.writeFileSync(repoVersionPath, JSON.stringify(newVersionData, null, 2) + '\n');
}

console.log(`✅ Version bumped to ${newVersion}`);
console.log(`📅 Build date: ${newVersionData.buildDate}`);
console.log('🔄 Remember to restart your dev server or rebuild!');
