const https = require('https');
const sharp = require('sharp');
const fs = require('fs');
const { convertToIco } = require('../dist/png-to-ico.js');

https.get('https://avatars.githubusercontent.com/u/9919?s=200&v=4', (res) => {
  const data = [];
  res.on('data', (chunk) => data.push(chunk));
  res.on('end', async () => {
    const pngBuffer = Buffer.concat(data);
    const icoBuffer = await convertToIco(pngBuffer);
    fs.writeFileSync('github.ico', icoBuffer);
    console.log('✅ ICO généré à partir du logo GitHub');
  });
});
