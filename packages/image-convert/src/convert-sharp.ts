import sharp from 'sharp';
import toIco from 'to-ico';

export interface IcoOptions {
  autoOrient?: boolean;
  stripMetadata?: boolean;
  sizes?: number[];
}

/**
 * Converts an image buffer to an ICO buffer.
 * Only usable in Node.js (uses sharp).
 */
export async function convertToIco(
  inputBuffer: Buffer,
  options?: IcoOptions
): Promise<Buffer> {
  if (!Buffer.isBuffer(inputBuffer)) {
    throw new Error('Input must be a Buffer');
  }

  const {
    autoOrient = true,
    stripMetadata = true,
    sizes = [16, 24, 32, 48, 64, 96, 128, 192, 256],
  } = options ?? {};

  const MIN_SIZE = 16;
  const MAX_SIZE = 256;
  for (const size of sizes) {
    if (size < MIN_SIZE || size > MAX_SIZE) {
      throw new Error(
        `Size ${size} is out of range. Must be between ${MIN_SIZE} and ${MAX_SIZE} pixels.`
      );
    }
  }

  const pngBuffers = await Promise.all(
    sizes.map(async (size) => {
      let sharpInstance = sharp(inputBuffer);

      if (autoOrient) {
        sharpInstance = sharpInstance.rotate();
      }

      return sharpInstance
        .resize(size, size, {
          fit: 'cover',
          kernel: sharp.kernel.cubic,
        })
        .ensureAlpha()
        .png({
          compressionLevel: 9,
        })
        .toBuffer();
    })
  );

  return await toIco(pngBuffers);
}
