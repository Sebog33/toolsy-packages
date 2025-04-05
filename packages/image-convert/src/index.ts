export type { IcoOptions } from './convert-sharp';

/**
 * Safe entrypoint for server environments. Dynamically imports sharp to avoid build issues.
 */
export async function convertToIco(
  inputBuffer: Buffer,
  options?: import('./convert-sharp').IcoOptions
): Promise<Buffer> {
  if (typeof window !== 'undefined') {
    throw new Error('convertToIco cannot run in the browser.');
  }

  const { convertToIco } = await import('./convert-sharp');
  return convertToIco(inputBuffer, options);
}
