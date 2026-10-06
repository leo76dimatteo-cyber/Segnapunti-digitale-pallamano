import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

async function generateIcons() {
  console.log('🚀 Avvio generazione icone PWA ad alta definizione con Sharp...');

  const iconSvgPath = path.join(publicDir, 'icon.svg');
  const iconMaskableSvgPath = path.join(publicDir, 'icon-maskable.svg');

  if (!fs.existsSync(iconSvgPath)) {
    throw new Error(`File SVG sorgente non trovato in: ${iconSvgPath}`);
  }
  if (!fs.existsSync(iconMaskableSvgPath)) {
    throw new Error(`File SVG maskable non trovato in: ${iconMaskableSvgPath}`);
  }

  const svgBuffer = fs.readFileSync(iconSvgPath);
  const maskableSvgBuffer = fs.readFileSync(iconMaskableSvgPath);

  // 1. PWA 192x192 PNG (Standard)
  await sharp(svgBuffer, { density: 300 })
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✅ Generato: /public/pwa-192x192.png (192x192)');

  // 2. PWA 512x512 PNG (Standard Splash / App Icon)
  await sharp(svgBuffer, { density: 300 })
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✅ Generato: /public/pwa-512x512.png (512x512)');

  // 3. PWA Maskable 512x512 PNG (Safe Zone 80% su sfondo pieno Navy)
  await sharp(maskableSvgBuffer, { density: 300 })
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✅ Generato: /public/pwa-maskable-512x512.png (512x512 Maskable)');

  // 4. Apple Touch Icon 180x180 PNG (iOS richiede sfondo pieno opaco)
  await sharp(maskableSvgBuffer, { density: 300 })
    .resize(180, 180)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ Generato: /public/apple-touch-icon.png (180x180 iOS)');

  // 5. Favicon 48x48 / Multi-format
  await sharp(svgBuffer, { density: 300 })
    .resize(48, 48)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✅ Generato: /public/favicon.ico (48x48)');

  console.log('🎉 Tutte le icone PWA generate con successo dal nuovo logo vettoriale!');
}

generateIcons().catch((err) => {
  console.error('❌ Errore durante la generazione delle icone:', err);
  process.exit(1);
});
