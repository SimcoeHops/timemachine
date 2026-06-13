// Run once: node generate-icons.mjs
// Generates terminal-green icons without any external dependencies
import { createCanvas } from 'canvas';
import { writeFileSync, existsSync } from 'fs';
import { createRequire } from 'module';

// Fallback: write raw SVG-based PNG using pure Node if canvas isn't available
function svgToPngFallback(size, outPath) {
  // Minimal valid PNG (solid #030a03 background with green "T" glyph)
  // We'll write an SVG that browsers can use directly — rename to .svg if canvas fails
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#030a03" rx="${size * 0.12}"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="monospace" font-size="${size * 0.55}" font-weight="bold" fill="#39ff14">T</text>
  <rect x="${size*0.1}" y="${size*0.75}" width="${size*0.8}" height="${size*0.04}" fill="#39ff14" opacity="0.6"/>
</svg>`;
  writeFileSync(outPath.replace('.png', '.svg'), svg);
  console.log(`Wrote SVG fallback: ${outPath.replace('.png', '.svg')}`);
}

try {
  const { createCanvas: cc } = await import('canvas');
  for (const size of [192, 512]) {
    const canvas = cc(size, size);
    const ctx = canvas.getContext('2d');
    // Background
    ctx.fillStyle = '#030a03';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.12);
    ctx.fill();
    // Glyph
    ctx.fillStyle = '#39ff14';
    ctx.font = `bold ${size * 0.55}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('T', size / 2, size / 2);
    // Scanline accent
    ctx.fillStyle = 'rgba(57,255,20,0.5)';
    ctx.fillRect(size * 0.1, size * 0.75, size * 0.8, size * 0.04);

    const buf = canvas.toBuffer('image/png');
    writeFileSync(`public/icon-${size}.png`, buf);
    console.log(`Wrote public/icon-${size}.png`);
  }
} catch {
  console.log('canvas package not available — writing SVG fallbacks instead');
  svgToPngFallback(192, 'public/icon-192.png');
  svgToPngFallback(512, 'public/icon-512.png');
}
