// File upload utility for Next.js Server Actions
// Saves files to public/uploads directory

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function uploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create unique filename
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
  const relativePath = `/uploads/${filename}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  const fullPath = join(uploadDir, filename);

  // Ensure directory exists
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Ignore error if exists
  }

  // Write file
  await writeFile(fullPath, buffer);
  
  return relativePath;
}
