import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { convertToIco } from '../src/index';

// Fonction pour créer une image PNG simple pour les tests
async function createTestPng(): Promise<Buffer> {
  return await sharp({
    create: {
      width: 64,
      height: 64,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 0.5 } // Rouge semi-transparent
    }
  })
  .png()
  .toBuffer();
}

describe('convertToIco', () => {
  it('should convert a PNG buffer to an ICO buffer with default options', async () => {
    const pngBuffer = await createTestPng();
    const icoBuffer = await convertToIco(pngBuffer);

    // Vérifier que le buffer ICO est bien généré
    expect(icoBuffer).toBeInstanceOf(Buffer);
    expect(icoBuffer.length).toBeGreaterThan(0);

    // Vérifier que c'est bien un fichier ICO (les 4 premiers octets doivent être 0x00 0x00 0x01 0x00)
    expect(icoBuffer[0]).toBe(0x00);
    expect(icoBuffer[1]).toBe(0x00);
    expect(icoBuffer[2]).toBe(0x01);
    expect(icoBuffer[3]).toBe(0x00);
  });

  it('should respect custom sizes', async () => {
    const pngBuffer = await createTestPng();
    const customSizes = [16, 32, 64];
    
    const icoBuffer = await convertToIco(pngBuffer, {
      sizes: customSizes
    });

    // Vérifier que le buffer ICO est bien généré
    expect(icoBuffer).toBeInstanceOf(Buffer);
    expect(icoBuffer.length).toBeGreaterThan(0);

    // Vérifier que le nombre d'images dans l'ICO correspond au nombre de tailles demandées
    // Le nombre d'images est stocké à l'offset 4 (1 octet)
    expect(icoBuffer[4]).toBe(customSizes.length);
  });

  it('should handle edge cases for sizes', async () => {
    const pngBuffer = await createTestPng();
    
    // Test avec une taille très petite
    await expect(convertToIco(pngBuffer, { sizes: [1] }))
      .rejects
      .toThrow('Size 1 is out of range. Must be between 16 and 256 pixels.');

    // Test avec une taille très grande
    await expect(convertToIco(pngBuffer, { sizes: [1024] }))
      .rejects
      .toThrow('Size 1024 is out of range. Must be between 16 and 256 pixels.');

    // Test avec des tailles valides mais non-standard
    const icoBuffer = await convertToIco(pngBuffer, { sizes: [20, 40, 60] });
    expect(icoBuffer).toBeInstanceOf(Buffer);
    expect(icoBuffer.length).toBeGreaterThan(0);
  });

  it('should handle invalid input', async () => {
    // Test avec un buffer invalide
    const invalidBuffer = Buffer.from('not an image');
    await expect(convertToIco(invalidBuffer))
      .rejects
      .toThrow();

    // Test avec un type invalide
    const invalidInput: any = 'not a buffer';
    await expect(convertToIco(invalidInput))
      .rejects
      .toThrow('Input must be a Buffer');
  });

  it('should handle different input image formats', async () => {
    // Test avec une image JPEG
    const jpegBuffer = await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .jpeg()
    .toBuffer();

    const icoBuffer = await convertToIco(jpegBuffer);
    expect(icoBuffer).toBeInstanceOf(Buffer);
    expect(icoBuffer.length).toBeGreaterThan(0);
  });
}); 