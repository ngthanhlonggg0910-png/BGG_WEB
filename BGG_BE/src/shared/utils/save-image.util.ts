import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import type {} from 'multer';

import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

export const SAMPLE_INSPECTION_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export function getSampleInspectionImageFolder(): string {
  const folderPath = process.env.SAMPLE_INSPECTION_IMAGE_PATH?.trim();

  if (!folderPath) {
    throw new InternalServerErrorException('Chưa cấu hình đường dẫn lưu ảnh');
  }

  return folderPath;
}

export async function saveImage(file: Express.Multer.File): Promise<string> {
  const folderPath = getSampleInspectionImageFolder();

  if (!file?.buffer?.length || file.size <= 0) {
    throw new BadRequestException('File ảnh không có nội dung');
  }

  if (file.size > SAMPLE_INSPECTION_IMAGE_MAX_BYTES) {
    throw new BadRequestException('Dung lượng ảnh không được vượt quá 5 MB');
  }

  const extension = IMAGE_EXTENSIONS[file.mimetype];

  if (!extension || !hasValidImageSignature(file.buffer, file.mimetype)) {
    throw new BadRequestException('Định dạng ảnh không hợp lệ');
  }

  await fs.mkdir(folderPath, { recursive: true });

  const fileName = `${randomUUID()}${extension}`;

  const filePath = path.join(folderPath, fileName);

  await fs.writeFile(filePath, file.buffer);

  return filePath;
}

export async function deleteImageIfSafe(filePath: string): Promise<boolean> {
  if (!isSampleInspectionImagePath(filePath)) return false;

  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

export function isSampleInspectionImagePath(filePath: string): boolean {
  if (!filePath) return false;

  const folderPath = path.resolve(getSampleInspectionImageFolder());
  const targetPath = path.resolve(filePath);
  const relativePath = path.relative(folderPath, targetPath);

  return (
    Boolean(relativePath) &&
    !relativePath.startsWith(`..${path.sep}`) &&
    relativePath !== '..' &&
    !path.isAbsolute(relativePath)
  );
}

function hasValidImageSignature(buffer: Buffer, mimeType: string): boolean {
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;
  const isPng =
    buffer.length >= 8 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp =
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP';

  return (
    (mimeType === 'image/jpeg' && isJpeg) ||
    (mimeType === 'image/png' && isPng) ||
    (mimeType === 'image/webp' && isWebp)
  );
}
