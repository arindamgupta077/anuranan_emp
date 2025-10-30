const fs = require('fs');
const path = require('path');

// Read current version
const versionPath = path.join(__dirname, '..', 'version.json');
const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));

// Parse version
const [major, minor, patch] = versionData.version.split('.').map(Number);

// Increment patch version
const newVersion = `${major}.${minor}.${patch + 1}`;

// Update version data
const newVersionData = {
  version: newVersion,
  buildDate: new Date().toISOString()
};

// Write new version
fs.writeFileSync(versionPath, JSON.stringify(newVersionData, null, 2) + '\n');

// Update _app.tsx with new version
const appPath = path.join(__dirname, '..', 'pages', '_app.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

// Replace version constant
appContent = appContent.replace(
  /const APP_VERSION = ['"][\d.]+['"]/,
  `const APP_VERSION = '${newVersion}'`
);

fs.writeFileSync(appPath, appContent);

console.log(`✅ Version bumped to ${newVersion}`);
console.log(`📅 Build date: ${newVersionData.buildDate}`);
console.log('🔄 Remember to restart your dev server or rebuild!');
