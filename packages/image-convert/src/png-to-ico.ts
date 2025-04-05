import sharp from 'sharp';
import toIco from 'to-ico';

/**
 * Options for the ICO conversion.
 */
export interface IcoOptions {
  /**
   * Automatically rotate the image based on EXIF orientation data.
   * @default true
   */
  autoOrient?: boolean;
  /**
   * Remove all metadata (EXIF, profiles, comments) to reduce file size.
   * Sharp removes metadata by default during processing.
   * @default true
   */
  stripMetadata?: boolean;
  /**
   * Sizes to generate for the ICO file (in pixels)
   * @default [16, 24, 32, 48, 64, 96, 128, 192, 256]
   */
  sizes?: number[];
}

/**
 * Converts an image buffer to an ICO buffer.
 * This function is suitable for both server and client-side usage.
 *
 * @param inputBuffer - Buffer containing the image data
 * @param options - Conversion options
 * @returns Promise<Buffer> - The resulting ICO buffer
 * @throws Error if the input is invalid or if the sizes are out of range
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
    sizes = [16, 24, 32, 48, 64, 96, 128, 192, 256]
  } = options ?? {};

  // Validate sizes
  const MIN_SIZE = 16;
  const MAX_SIZE = 256;
  
  for (const size of sizes) {
    if (size < MIN_SIZE || size > MAX_SIZE) {
      throw new Error(`Size ${size} is out of range. Must be between ${MIN_SIZE} and ${MAX_SIZE} pixels.`);
    }
  }

  // Generate resized PNG buffers for each size using sharp
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

  // Combine PNG buffers into a single ICO buffer
  return await toIco(pngBuffers);
} 