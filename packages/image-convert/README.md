# @toolsycc/image-convert

> A lightweight and focused utility to convert PNG images to ICO format and generate favicons.  
> ✅ Works with both **TypeScript** and **JavaScript** (ESM & CommonJS).

## Features

- PNG to ICO conversion
- Complete favicon generation for web and Windows
- Support for:
  - Input from file path or Buffer
  - EXIF-based auto-orientation
  - Metadata stripping to reduce file size
  - Automatic multiple size generation (16x16 to 256x256)
  - Custom output directory and file naming
  - Selective size generation
- Minimalist and no unnecessary dependencies
- Windows icon compatible output

## Installation

```bash
pnpm add @toolsycc/image-convert
```

Or with npm:

```bash
npm install @toolsycc/image-convert
```

## Usage Examples

### 🟦 TypeScript

```ts
import { pngToIco, generateFavicon } from '@toolsycc/image-convert';
import { promises as fs } from 'fs';

// Basic ICO conversion from file path
await pngToIco('input.png', 'output.ico');

// Generate complete favicon set
await generateFavicon('input.png', {
  outputDir: 'public/favicon',    // Custom output directory
  baseName: 'my-favicon',         // Custom base name for files
  webSizes: [32, 64, 128],       // Only generate specific sizes
  generateIco: true              // Also generate Windows ICO file
});

// From Buffer with detailed example
async function convertPngToIco() {
  // Read PNG file into a Buffer
  const pngBuffer = await fs.readFile('input.png');
  
  // Convert with custom options
  await pngToIco(pngBuffer, 'output.ico', {
    autoOrient: true,    // Auto-orient based on EXIF
    stripMetadata: true  // Remove metadata
  });
  
  console.log('Conversion completed successfully');
}

// Handle errors
try {
  await convertPngToIco();
} catch (error) {
  console.error('Conversion failed:', error);
}
```

### 🟨 JavaScript (CommonJS)

```js
const { pngToIco, generateFavicon } = require('@toolsycc/image-convert');
const fs = require('fs').promises;

// Simple ICO conversion
pngToIco('input.png', 'output.ico')
  .then(() => console.log('Conversion completed'))
  .catch(console.error);

// Generate favicons
generateFavicon('input.png')
  .then(() => console.log('Favicons generated'))
  .catch(console.error);

// Buffer example
async function convert() {
  const buffer = await fs.readFile('input.png');
  await pngToIco(buffer, 'output.ico');
}
```

### 🟩 JavaScript (ESM)

```js
import { pngToIco, generateFavicon } from '@toolsycc/image-convert';
import { promises as fs } from 'fs';

// With error handling
try {
  // Generate complete favicon set
  await generateFavicon('input.png', {
    outputDir: 'public/favicon',
    baseName: 'site-favicon'
  });
  
  // Using Buffer for ICO conversion
  const imageBuffer = await fs.readFile('input.png');
  await pngToIco(imageBuffer, 'output.ico');
  
  console.log('Conversion successful');
} catch (error) {
  console.error('Conversion error:', error);
}
```

## Options

### PngToIcoOptions

```ts
interface PngToIcoOptions {
  /**
   * Auto-orient based on EXIF data
   * @default true
   */
  autoOrient?: boolean;
  
  /**
   * Remove metadata (EXIF, profiles, comments)
   * @default true
   */
  stripMetadata?: boolean;
}
```

### FaviconOptions

```ts
interface FaviconOptions extends PngToIcoOptions {
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
```

## Output Files

When using `generateFavicon`, the following files are created by default:

- `favicon.ico` - Windows icon file containing all sizes
- PNG files for each size: `favicon-16x16.png`, `favicon-32x32.png`, etc.

You can customize the output directory and base name using options.

## Motivation

This package was designed to simplify PNG to ICO conversion and favicon generation, particularly useful for developers creating Windows applications or websites requiring high-quality favicons.

## Author

Made by [@Sebog33](https://github.com/Sebog33)  
Follow [Toolsy](https://www.toolsy.cc) for more tiny dev-focused utilities.

## License

MIT
