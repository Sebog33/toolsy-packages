import { promises as fs } from 'fs';
import sharp from 'sharp';
import toIco from 'to-ico';
import path from 'path';

/**
 * Options for the pngToIco conversion.
 */
export interface PngToIcoOptions {
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
  // We could add an option for specific sizes in the future if needed
}

/**
 * Options for favicon generation
 */
export interface FaviconOptions extends PngToIcoOptions {
  /**
   * Output directory for the favicon files
   * @default "favicon"
   */
  outputDir?: string;
  /**
   * Base name for the favicon files
   * @default "favicon"
   */
  baseName?: string;
  /**
   * Sizes to generate for web favicons (in pixels)
   * @default [16, 24, 32, 48, 64, 96, 128, 192, 256]
   */
  webSizes?: number[];
  /**
   * Whether to generate Windows ICO file
   * @default true
   */
  generateIco?: boolean;
}

/**
 * Converts a PNG image file or Buffer to an ICO file.
 *
 * @param input - Path to the input PNG file (string) or a Buffer containing the PNG data.
 * @param outputPath - Path where the output ICO file will be saved.
 * @param options - Conversion options.
 */
export async function pngToIco(
  input: string | Buffer,
  outputPath: string,
  options?: PngToIcoOptions
): Promise<void> {
  // Default options
  const { autoOrient = true, stripMetadata = true } = options ?? {};

  let imageBuffer: Buffer;
  let inputSourceDescription: string;

  if (typeof input === 'string') {
    inputSourceDescription = input; // Input is a path
    console.log(`Reading image from path: ${inputSourceDescription}`);
    imageBuffer = await fs.readFile(input);
  } else if (Buffer.isBuffer(input)) {
    inputSourceDescription = 'Buffer'; // Input is a buffer
    console.log(`Using image data from Buffer.`);
    imageBuffer = input;
  } else {
    // Optional: Handle Base64 string input here if desired
    // imageBuffer = Buffer.from(input, 'base64');
    // inputSourceDescription = 'Base64 string';
    throw new Error('Invalid input type. Expected string (path) or Buffer.');
  }

  console.log(`Converting ${inputSourceDescription} to ${outputPath} with options:`, { autoOrient, stripMetadata });

  // Define standard ICO sizes based on the provided image
  const sizes = [16, 24, 32, 48, 64, 96, 128, 192, 256];

  // Generate resized PNG buffers for each size using sharp
  const pngBuffers = await Promise.all(
    sizes.map(async (size) => {
      console.log(`Resizing image to ${size}x${size}...`);
      let sharpInstance = sharp(imageBuffer);

      // Apply auto-orientation if enabled
      if (autoOrient) {
        sharpInstance = sharpInstance.rotate();
      }

      // Note: stripMetadata is generally handled by sharp by default when outputting.
      // Explicitly setting it might be needed if sharp's defaults change
      // or if we wanted to *keep* metadata (which would be the non-default case).

      return sharpInstance
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png() // Ensure output is PNG format
        .toBuffer();
    })
  );

  console.log(`Generated ${pngBuffers.length} PNG buffers of different sizes.`);

  // Combine these PNG buffers into a single ICO file buffer
  console.log('Combining PNG buffers into ICO format...');
  const icoBuffer = await toIco(pngBuffers);

  // Write the resulting ICO buffer to outputPath
  console.log(`Writing ICO file to ${outputPath}...`);
  await fs.writeFile(outputPath, icoBuffer);

  console.log(`Successfully converted ${inputSourceDescription} to ${outputPath}`);
}

/**
 * Generates a complete set of favicons for web and Windows
 * 
 * @param input - Path to the input PNG file (string) or a Buffer containing the PNG data
 * @param options - Generation options
 */
export async function generateFavicon(
  input: string | Buffer,
  options?: FaviconOptions
): Promise<void> {
  const {
    outputDir = 'favicon',
    baseName = 'favicon',
    webSizes = [16, 24, 32, 48, 64, 96, 128, 192, 256],
    generateIco = true,
    ...pngToIcoOptions
  } = options ?? {};

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  let imageBuffer: Buffer;
  if (typeof input === 'string') {
    console.log(`Reading image from path: ${input}`);
    imageBuffer = await fs.readFile(input);
  } else if (Buffer.isBuffer(input)) {
    console.log('Using image data from Buffer');
    imageBuffer = input;
  } else {
    throw new Error('Invalid input type. Expected string (path) or Buffer.');
  }

  // Generate PNG files for web
  await Promise.all(
    webSizes.map(async (size) => {
      console.log(`Generating ${size}x${size} PNG favicon...`);
      const outputPath = path.join(outputDir, `${baseName}-${size}x${size}.png`);
      
      await sharp(imageBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
    })
  );

  // Generate ICO file if requested
  if (generateIco) {
    console.log('Generating ICO file...');
    const icoPath = path.join(outputDir, `${baseName}.ico`);
    await pngToIco(imageBuffer, icoPath, pngToIcoOptions);
  }

  console.log('Favicon generation completed successfully');
} 