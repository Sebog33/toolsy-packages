# @toolsycc/image-convert

> A lightweight and focused utility to convert images to ICO format.  
> ✅ Works with both **TypeScript** and **JavaScript** (ESM & CommonJS).

## Features

- Image to ICO conversion (supports PNG, JPEG, etc.)
- Support for:
  - Input from Buffer
  - EXIF-based auto-orientation
  - Metadata stripping to reduce file size
  - Automatic multiple size generation (16x16 to 256x256)
  - Custom size selection
- Minimalist and no unnecessary dependencies
- Windows icon compatible output
- Works in both Node.js and browser environments

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
import { convertToIco } from '@toolsycc/image-convert';
import { promises as fs } from 'fs';

// Basic ICO conversion from file
async function convertFileToIco() {
  // Read image file into a Buffer
  const imageBuffer = await fs.readFile('input.png');
  
  // Convert to ICO buffer
  const icoBuffer = await convertToIco(imageBuffer);
  
  // Save the ICO buffer to a file
  await fs.writeFile('output.ico', icoBuffer);
  
  console.log('Conversion completed successfully');
}

// With custom options
async function convertWithOptions() {
  const imageBuffer = await fs.readFile('input.png');
  
  const icoBuffer = await convertToIco(imageBuffer, {
    autoOrient: true,    // Auto-orient based on EXIF
    stripMetadata: true, // Remove metadata
    sizes: [16, 32, 64] // Custom sizes
  });
  
  await fs.writeFile('output.ico', icoBuffer);
}

// Handle errors
try {
  await convertFileToIco();
} catch (error) {
  console.error('Conversion failed:', error);
}
```

### 🟨 JavaScript (CommonJS)

```js
const { convertToIco } = require('@toolsycc/image-convert');
const fs = require('fs').promises;

// Simple conversion
async function convert() {
  const buffer = await fs.readFile('input.png');
  const icoBuffer = await convertToIco(buffer);
  await fs.writeFile('output.ico', icoBuffer);
}

convert()
  .then(() => console.log('Conversion completed'))
  .catch(console.error);
```

### 🟩 JavaScript (ESM)

```js
import { convertToIco } from '@toolsycc/image-convert';
import { promises as fs } from 'fs';

// With error handling
try {
  const imageBuffer = await fs.readFile('input.png');
  const icoBuffer = await convertToIco(imageBuffer);
  await fs.writeFile('output.ico', icoBuffer);
  console.log('Conversion successful');
} catch (error) {
  console.error('Conversion error:', error);
}
```

### 🌐 Browser Usage

```js
import { convertToIco } from '@toolsycc/image-convert';

// Convert from File input
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const icoBuffer = await convertToIco(buffer);
  
  // Create download link
  const blob = new Blob([icoBuffer], { type: 'image/x-icon' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'icon.ico';
  a.click();
  URL.revokeObjectURL(url);
});
```

## Options

### IcoOptions

```ts
interface IcoOptions {
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
  
  /**
   * Sizes to generate for the ICO file (in pixels)
   * Must be between 16 and 256 pixels
   * @default [16, 24, 32, 48, 64, 96, 128, 192, 256]
   */
  sizes?: number[];
}
```

## Error Handling

The function will throw errors in the following cases:
- Input is not a Buffer
- Image size is less than 16px or greater than 256px
- Invalid image format
- Processing errors

## Motivation

This package was designed to provide a simple and efficient way to convert images to ICO format, working seamlessly in both Node.js and browser environments. It's particularly useful for developers creating Windows applications or websites requiring high-quality icons.

## Author

Made by [@Sebog33](https://github.com/Sebog33)  
Follow [Toolsy](https://www.toolsy.cc) for more tiny dev-focused utilities.

## License

MIT
