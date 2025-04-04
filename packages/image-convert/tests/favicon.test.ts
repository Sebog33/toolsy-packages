import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateFavicon } from '../src/png-to-ico';

// Définir un répertoire temporaire pour les tests
const testRootDir = path.join(__dirname, 'favicon-test-output');
const testInputDir = path.join(testRootDir, 'input');
const testOutputDir = path.join(testRootDir, 'output');
const testInputPng = path.join(testInputDir, 'test-input.png');

// Fonction pour créer une image PNG simple pour les tests
async function createTestPng(filePath: string): Promise<Buffer> {
  const width = 256;
  const height = 256;
  const buffer = await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 0, g: 0, b: 255, alpha: 1 } // Bleu opaque
    }
  })
  .png()
  .toBuffer();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
  return buffer;
}

describe('generateFavicon', () => {
  let testPngBuffer: Buffer;

  // Créer les répertoires et l'image de test avant tous les tests
  beforeAll(async () => {
    // Créer les répertoires nécessaires
    await fs.mkdir(testInputDir, { recursive: true });
    await fs.mkdir(testOutputDir, { recursive: true });
    
    // Créer l'image de test
    testPngBuffer = await createTestPng(testInputPng);
  });

  // Nettoyer tous les fichiers après les tests
  afterAll(async () => {
    await fs.rm(testRootDir, { recursive: true, force: true });
  });

  // Nettoyer uniquement le répertoire de sortie avant chaque test
  beforeEach(async () => {
    try {
      const entries = await fs.readdir(testOutputDir);
      await Promise.all(
        entries.map(entry => 
          fs.rm(path.join(testOutputDir, entry), { recursive: true, force: true })
        )
      );
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  });

  it('should generate favicons with default options from file path', async () => {
    const defaultOutputDir = path.join(testOutputDir, 'favicon');
    await generateFavicon(testInputPng, { outputDir: defaultOutputDir });

    // Vérifier la présence du fichier ICO
    const icoStats = await fs.stat(path.join(defaultOutputDir, 'favicon.ico'));
    expect(icoStats.isFile()).toBe(true);
    expect(icoStats.size).toBeGreaterThan(0);

    // Vérifier la présence des fichiers PNG pour chaque taille par défaut
    const defaultSizes = [16, 24, 32, 48, 64, 96, 128, 192, 256];
    for (const size of defaultSizes) {
      const pngStats = await fs.stat(path.join(defaultOutputDir, `favicon-${size}x${size}.png`));
      expect(pngStats.isFile()).toBe(true);
      expect(pngStats.size).toBeGreaterThan(0);
    }
  });

  it('should generate favicons with default options from buffer', async () => {
    const defaultOutputDir = path.join(testOutputDir, 'favicon');
    await generateFavicon(testPngBuffer, { outputDir: defaultOutputDir });

    // Vérifier la présence du fichier ICO
    const icoStats = await fs.stat(path.join(defaultOutputDir, 'favicon.ico'));
    expect(icoStats.isFile()).toBe(true);
    expect(icoStats.size).toBeGreaterThan(0);

    // Vérifier quelques fichiers PNG
    const sampleSizes = [16, 64, 256];
    for (const size of sampleSizes) {
      const pngStats = await fs.stat(path.join(defaultOutputDir, `favicon-${size}x${size}.png`));
      expect(pngStats.isFile()).toBe(true);
      expect(pngStats.size).toBeGreaterThan(0);
    }
  });

  it('should respect custom output directory and base name', async () => {
    const customDir = path.join(testOutputDir, 'custom-favicons');
    const customBaseName = 'custom-favicon';

    await generateFavicon(testInputPng, {
      outputDir: customDir,
      baseName: customBaseName
    });

    // Vérifier la présence du fichier ICO avec le nom personnalisé
    const icoStats = await fs.stat(path.join(customDir, `${customBaseName}.ico`));
    expect(icoStats.isFile()).toBe(true);

    // Vérifier quelques fichiers PNG avec le nom personnalisé
    const sampleSizes = [16, 64, 256];
    for (const size of sampleSizes) {
      const pngStats = await fs.stat(path.join(customDir, `${customBaseName}-${size}x${size}.png`));
      expect(pngStats.isFile()).toBe(true);
    }
  });

  it('should generate only specified sizes', async () => {
    const defaultOutputDir = path.join(testOutputDir, 'favicon');
    const customSizes = [32, 64];
    
    await generateFavicon(testInputPng, {
      outputDir: defaultOutputDir,
      webSizes: customSizes
    });

    // Vérifier la présence uniquement des tailles spécifiées
    for (const size of customSizes) {
      const pngStats = await fs.stat(path.join(defaultOutputDir, `favicon-${size}x${size}.png`));
      expect(pngStats.isFile()).toBe(true);
    }

    // Vérifier qu'une taille non spécifiée n'existe pas
    await expect(
      fs.stat(path.join(defaultOutputDir, 'favicon-96x96.png'))
    ).rejects.toThrow();
  });

  it('should not generate ICO file when generateIco is false', async () => {
    const defaultOutputDir = path.join(testOutputDir, 'favicon');
    
    await generateFavicon(testInputPng, {
      outputDir: defaultOutputDir,
      generateIco: false
    });

    // Vérifier que le fichier ICO n'existe pas
    await expect(
      fs.stat(path.join(defaultOutputDir, 'favicon.ico'))
    ).rejects.toThrow();

    // Mais vérifier que les PNG sont toujours générés
    const sampleSizes = [16, 64, 256];
    for (const size of sampleSizes) {
      const pngStats = await fs.stat(path.join(defaultOutputDir, `favicon-${size}x${size}.png`));
      expect(pngStats.isFile()).toBe(true);
    }
  });

  it('should throw an error for invalid input type', async () => {
    const invalidInput: any = 12345;
    await expect(generateFavicon(invalidInput))
      .rejects
      .toThrow('Invalid input type. Expected string (path) or Buffer.');
  });
}); 