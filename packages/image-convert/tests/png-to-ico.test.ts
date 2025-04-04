import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp'; // Pour générer une image de test
import { pngToIco } from '../src/png-to-ico'; // Ajuster le chemin si nécessaire

// Définir un répertoire temporaire pour les tests
const testOutputDir = path.join(__dirname, 'test-output');
const testInputPng = path.join(testOutputDir, 'test-input.png');
const testOutputIco = path.join(testOutputDir, 'test-output.ico');

// Fonction pour créer une image PNG simple pour les tests
async function createTestPng(filePath: string): Promise<Buffer> {
  const width = 64;
  const height = 64;
  const buffer = await sharp({
    create: {
      width: width,
      height: height,
      channels: 4, // RGBA
      background: { r: 255, g: 0, b: 0, alpha: 0.5 } // Rouge semi-transparent
    }
  })
  .png()
  .toBuffer();
  await fs.writeFile(filePath, buffer);
  return buffer;
}

describe('pngToIco', () => {
  let testPngBuffer: Buffer;

  // Créer le répertoire de sortie et l'image de test avant tous les tests
  beforeAll(async () => {
    await fs.mkdir(testOutputDir, { recursive: true });
    testPngBuffer = await createTestPng(testInputPng);
  });

  // Nettoyer les fichiers et le répertoire après tous les tests
  afterAll(async () => {
    await fs.rm(testOutputDir, { recursive: true, force: true });
  });

  // Nettoyer le fichier de sortie potentiel avant chaque test individuel
  beforeEach(async () => {
    try {
      await fs.unlink(testOutputIco);
    } catch (error: any) {
      if (error.code !== 'ENOENT') { // Ignore "file not found"
        throw error;
      }
    }
  });

  it('should convert a PNG file path to an ICO file with default options', async () => {
    // Appel sans options explicites, utilise les valeurs par défaut
    await pngToIco(testInputPng, testOutputIco);

    // Vérifier si le fichier ICO existe
    const stats = await fs.stat(testOutputIco);
    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBeGreaterThan(0);
  });

  it('should convert a PNG Buffer to an ICO file with default options', async () => {
    // Appel sans options explicites
    await pngToIco(testPngBuffer, testOutputIco);

    // Vérifier si le fichier ICO existe
    const stats = await fs.stat(testOutputIco);
    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBeGreaterThan(0);
  });

  it('should accept explicit options', async () => {
    // Appel avec options explicites (désactivées)
    await pngToIco(testInputPng, testOutputIco, { autoOrient: false, stripMetadata: false });

    // Vérifier si le fichier ICO existe (la vérification de l'effet des options est plus complexe)
    const stats = await fs.stat(testOutputIco);
    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBeGreaterThan(0);
  });

  it('should throw an error for invalid input type', async () => {
    const invalidInput: any = 12345; // Utiliser un nombre comme entrée invalide
    // Appel sans options
    await expect(pngToIco(invalidInput, testOutputIco))
      .rejects
      .toThrow('Invalid input type. Expected string (path) or Buffer.');

    // Vérifier qu'aucun fichier ICO n'a été créé
     await expect(fs.stat(testOutputIco)).rejects.toThrow(); // Doit échouer car le fichier n'existe pas
  });

  // On pourrait ajouter d'autres tests:
  // - Fichier PNG invalide/corrompu
  // - Chemin de sortie invalide/non accessible en écriture
  // - Vérification plus détaillée du contenu du fichier ICO (ex: lire l'en-tête)
}); 