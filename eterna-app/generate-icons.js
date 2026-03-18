import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, 'static/icon.svg');
const outputDir = path.join(__dirname, 'static');

// Android 和 iOS 所需的图标尺寸
const sizes = [
  // Android
  { name: 'icon-72x72.png', size: 72 },      // ldpi
  { name: 'icon-96x96.png', size: 96 },      // mdpi
  { name: 'icon-144x144.png', size: 144 },   // hdpi
  { name: 'icon-192x192.png', size: 192 },   // xhdpi
  { name: 'icon-384x384.png', size: 384 },   // xxhdpi
  { name: 'icon-512x512.png', size: 512 },   // xxxhdpi
  // iOS
  { name: 'icon-20x20.png', size: 20 },      // notification
  { name: 'icon-40x40.png', size: 40 },      // notification@2x / ipad
  { name: 'icon-60x60.png', size: 60 },      // notification@3x
  { name: 'icon-76x76.png', size: 76 },      // ipad app
  { name: 'icon-120x120.png', size: 120 },   // iphone app@2x
  { name: 'icon-152x152.png', size: 152 },   // ipad app@2x
  { name: 'icon-180x180.png', size: 180 },   // iphone app@3x
  { name: 'icon-256x256.png', size: 256 },   // ipad proapp@2x
  { name: 'icon-1024x1024.png', size: 1024 }, // appstore
];

async function generateIcons() {
  console.log('🧩 开始生成科幻风格图标...\n');
  
  const svgBuffer = fs.readFileSync(svgPath);
  
  for (const { name, size } of sizes) {
    const outputPath = path.join(outputDir, name);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ 已生成: ${name} (${size}x${size})`);
  }
  
  console.log('\n🐦 所有图标生成完成！');
}

generateIcons().catch(console.error);