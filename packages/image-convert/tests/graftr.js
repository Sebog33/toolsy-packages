const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { convertToIco } = require('../dist/png-to-ico.js');

async function testGraftrConversion() {
  try {
    // Lire le fichier PNG
    const inputPath = join(__dirname, 'graftr.png');
    const pngBuffer = readFileSync(inputPath);

    // Convertir en ICO avec des tailles spécifiques pour le favicon
    const icoBuffer = await convertToIco(pngBuffer, {
      sizes: [32, 48, 64],
      autoOrient: true,
      stripMetadata: true
    });

    // Sauvegarder le fichier ICO
    const outputPath = join(__dirname, 'graftr.ico');
    writeFileSync(outputPath, icoBuffer);
    
    console.log('✅ Conversion réussie ! Le fichier ICO a été créé.');
  } catch (error) {
    console.error('❌ Erreur lors de la conversion:', error);
  }
}

// Exécuter le test
testGraftrConversion();
