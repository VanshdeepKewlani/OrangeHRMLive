import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

export async function createProfilePicture(): Promise<string> {
  const filePath = path.resolve('test-results', 'profile-picture.png');
  await writeFile(filePath, onePixelPng);
  return filePath;
}
