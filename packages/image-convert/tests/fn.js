const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');

async function convertToIco(inputBuffer) {
  const sizes = [16, 32, 48];

  const pngBuffers = await Promise.all(
    sizes.map((size) =>
      sharp(inputBuffer)
        .rotate()
        .resize(size, size, { fit: 'cover' })
        .ensureAlpha()
        .png()
        .toBuffer()
    )
  );

  return await toIco(pngBuffers);
}

(async () => {
  const inputBuffer = await fetch('https://avatars.githubusercontent.com/u/9919?s=200&v=4').then(res => res.arrayBuffer());
  const icoBuffer = await convertToIco(inputBuffer);
  fs.writeFileSync('github2.ico', icoBuffer);
})();
