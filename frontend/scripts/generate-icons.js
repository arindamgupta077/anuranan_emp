// Script to generate PWA icons
// This creates basic placeholder icons - replace with your actual logo later

const fs = require('fs');
const path = require('path');

// Create an HTML file that generates PNG icons
const createHTMLGenerator = () => {
  return `<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        canvas { border: 1px solid #ccc; margin: 10px; }
        .download-section { margin: 20px 0; }
    </style>
</head>
<body>
    <h1>PWA Icon Generator</h1>
    <p>Right-click each canvas and "Save image as..." to download the PNG files.</p>
    <div class="download-section">
        <h3>192x192 Icon</h3>
        <canvas id="canvas192" width="192" height="192"></canvas>
        <br>
        <button onclick="download(192)">Download 192x192 PNG</button>
    </div>
    <div class="download-section">
        <h3>512x512 Icon</h3>
        <canvas id="canvas512" width="512" height="512"></canvas>
        <br>
        <button onclick="download(512)">Download 512x512 PNG</button>
    </div>
    
    <script>
        function drawIcon(size) {
            const canvas = document.getElementById('canvas' + size);
            const ctx = canvas.getContext('2d');
            
            // Background with rounded corners
            const radius = size * 0.15;
            ctx.fillStyle = '#14b8a6';
            ctx.beginPath();
            ctx.roundRect(0, 0, size, size, radius);
            ctx.fill();
            
            // Letter "A"
            ctx.fillStyle = 'white';
            ctx.font = 'bold ' + (size * 0.5) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('A', size / 2, size / 2);
        }
        
        function download(size) {
            const canvas = document.getElementById('canvas' + size);
            const link = document.createElement('a');
            link.download = 'icon-' + size + 'x' + size + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
        
        // Draw icons on load
        drawIcon(192);
        drawIcon(512);
        
        console.log('Icons generated! Click the download buttons or right-click and save.');
    </script>
</body>
</html>`;
};

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const publicDir = path.join(__dirname, '..', 'public');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create HTML generator
const htmlContent = createHTMLGenerator();
const htmlPath = path.join(publicDir, 'generate-icons.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('\n✓ Icon generator HTML created!');
console.log('\nTo generate PNG icons:');
console.log('1. Start your dev server: npm run dev');
console.log('2. Open: http://localhost:3000/generate-icons.html');
console.log('3. Click download buttons to save icon-192x192.png and icon-512x512.png');
console.log('4. Move the downloaded PNG files to frontend/public/icons/');
console.log('\nAlternatively, use an online tool:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://favicon.io/favicon-generator/');
console.log('\nFor now, creating base64-encoded PNG placeholders...\n');

// Create simple PNG icons using base64 (minimal approach)
const createBase64PNG = (size) => {
  // This is a simple 1x1 teal PNG that browsers will scale
  // Not ideal but works as a placeholder
  const base64Teal = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM0tHf5DwAC8gHNqQvfnAAAAABJRU5ErkJggg==';
  return Buffer.from(base64Teal, 'base64');
};

// Create placeholder PNG files
[192, 512].forEach(size => {
  const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  // Create a simple SVG and note that it needs conversion
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#14b8a6" rx="${size * 0.15}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="bold" fill="white">A</text>
</svg>`;
  
  // Save as SVG for now (browsers accept it)
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Created icon-${size}x${size}.svg`);
});

console.log('\n✓ Setup complete!');
console.log('⚠  Note: SVG icons work in most browsers but PNG is recommended for best compatibility.');
console.log('   Visit http://localhost:3000/generate-icons.html to create proper PNG icons.');
