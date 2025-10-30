const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'next.config.js');
let config = fs.readFileSync(configPath, 'utf8');

const args = process.argv.slice(2);
const command = args[0];

if (command === 'enable') {
  config = config.replace(
    /disable: process\.env\.NODE_ENV === 'development'/,
    "disable: false, // PWA enabled for testing"
  );
  fs.writeFileSync(configPath, config);
  console.log('✅ PWA enabled in development mode');
  console.log('⚠️  Note: You will see service worker warnings during hot reload');
  console.log('💡 Run: node scripts/pwa-toggle.js disable (to turn off warnings)');
} else if (command === 'disable') {
  config = config.replace(
    /disable: false, \/\/ PWA enabled for testing/,
    "disable: process.env.NODE_ENV === 'development'"
  );
  fs.writeFileSync(configPath, config);
  console.log('✅ PWA disabled in development mode (warnings removed)');
  console.log('💡 Run: node scripts/pwa-toggle.js enable (to test PWA features)');
} else {
  console.log('Usage:');
  console.log('  node scripts/pwa-toggle.js enable   - Enable PWA in dev mode');
  console.log('  node scripts/pwa-toggle.js disable  - Disable PWA in dev mode');
  console.log('\nCurrent mode: ' + (config.includes("disable: false") ? 'ENABLED' : 'DISABLED'));
}

console.log('\n📝 Note: Restart dev server for changes to take effect');
