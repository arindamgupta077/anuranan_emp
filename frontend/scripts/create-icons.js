const fs = require('fs');
const path = require('path');
const https = require('https');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create a simple PNG using a data URL approach
// We'll create a proper canvas-based PNG generator

const createPNGIcon = async (size) => {
  return new Promise((resolve, reject) => {
    // Use a simple service to generate a placeholder
    // Or create a minimal PNG manually
    
    // Create a minimal valid PNG file (1x1 teal pixel that will be scaled by browser)
    // PNG header + IHDR + IDAT + IEND
    const tealColor = Buffer.from([0x14, 0xb8, 0xa6, 0xff]); // #14b8a6 with alpha
    
    // Minimal PNG structure (1x1 pixel)
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // For simplicity, let's create an SVG that we save as PNG
    // Mobile browsers accept SVG in manifest
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0d9488;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.18}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="white" opacity="0.2"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" 
        font-size="${size * 0.45}" 
        font-weight="700" 
        fill="white" 
        style="text-shadow: 0 2px 4px rgba(0,0,0,0.2)">A</text>
</svg>`;
    
    resolve(svgContent);
  });
};

async function generateIcons() {
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sizes = [192, 512];
  
  console.log('Generating PWA icons...\n');
  
  for (const size of sizes) {
    const svgContent = await createPNGIcon(size);
    const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✓ Created icon-${size}x${size}.svg`);
  }
  
  // Also create apple-touch-icon
  const appleTouchIcon = await createPNGIcon(180);
  const applePath = path.join(iconsDir, 'apple-touch-icon.svg');
  fs.writeFileSync(applePath, appleTouchIcon);
  console.log(`✓ Created apple-touch-icon.svg`);
  
  // Create favicon
  const favicon = await createPNGIcon(32);
  const faviconPath = path.join(__dirname, '..', 'public', 'favicon.svg');
  if (!fs.existsSync(faviconPath)) {
    fs.writeFileSync(faviconPath, favicon);
    console.log(`✓ Created favicon.svg`);
  }
  
  console.log('\n✅ Icon generation complete!');
  console.log('\n📱 PWA Installation:');
  console.log('   Android (Chrome): Menu → "Install app" or "Add to Home screen"');
  console.log('   iOS (Safari): Share button → "Add to Home Screen"\n');
  console.log('💡 For production: Consider using PNG icons instead of SVG');
  console.log('   Use: https://realfavicongenerator.net/ or https://favicon.io/\n');
}

generateIcons().catch(console.error);