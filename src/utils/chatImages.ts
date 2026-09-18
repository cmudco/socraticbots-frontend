import { socketConfig } from '@/config/socket.config';

import {
  type AttachedImage,
  type ImagePayload,
  MAX_ATTACHED_IMAGES,
  MAX_IMAGE_BYTES,
  type MessageImage,
  type SocketFile,
} from '@/types/chatAttachments';

export type RejectionReason = 'type' | 'size' | 'limit';

export interface ImageRejection {
  name: string;
  reason: RejectionReason;
}

export interface ReadImagesResult {
  images: AttachedImage[];
  rejected: ImageRejection[];
}

const isImage = (file: File) => file.type.startsWith('image/');

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/**
 * Turn dropped, picked, or pasted files into composer attachments. Only
 * images are accepted, each capped by size, and the total by `room`.
 */
export async function readImageFiles(files: File[], room: number): Promise<ReadImagesResult> {
  const images: AttachedImage[] = [];
  const rejected: ImageRejection[] = [];
  for (const file of files) {
    if (!isImage(file)) {
      rejected.push({ name: file.name, reason: 'type' });
      continue;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      rejected.push({ name: file.name, reason: 'size' });
      continue;
    }
    if (images.length >= room) {
      rejected.push({ name: file.name, reason: 'limit' });
      continue;
    }
    images.push({
      id: crypto.randomUUID(),
      preview: await readAsDataUrl(file),
      name: file.name || 'pasted-image.png',
      size: file.size,
      type: file.type,
    });
  }
  return { images, rejected };
}

export function describeRejections(rejected: ImageRejection[]): string | null {
  if (rejected.length === 0) return null;
  const reasons = new Set(rejected.map(item => item.reason));
  const parts: string[] = [];
  if (reasons.has('type')) parts.push('only images can be attached');
  if (reasons.has('size')) {
    parts.push(`images must be under ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB`);
  }
  if (reasons.has('limit')) parts.push(`at most ${MAX_ATTACHED_IMAGES} images per message`);
  const names = rejected.map(item => item.name).join(', ');
  return `Skipped ${names}: ${parts.join('; ')}.`;
}

export function imageFilesFromDataTransfer(transfer: DataTransfer | null): File[] {
  return transfer ? Array.from(transfer.files) : [];
}

/**
 * Image files from a paste. Returns `null` when the clipboard also carries
 * plain text (a rich-text paste from Word or a browser), so the default
 * paste inserts the text instead of attaching an incidental image.
 */
export function imageFilesFromClipboard(transfer: DataTransfer | null): File[] | null {
  if (!transfer) return null;
  const items = Array.from(transfer.items);
  if (items.some(item => item.type === 'text/plain')) return null;
  const files = items
    .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
    .map(item => item.getAsFile())
    .filter((file): file is File => file !== null);
  return files.length > 0 ? files : null;
}

export const imagesForPayload = (images: AttachedImage[]): ImagePayload[] =>
  images.map(({ preview, name, type }) => ({ preview, name, type }));

/** Previews shown on the optimistic user bubble before DARE echoes the message. */
export const previewsAsMessageImages = (images: AttachedImage[]): MessageImage[] =>
  images.map(({ id, preview, name }) => ({ id, url: preview, name }));

/** DARE serves message files by MEDIA_URL path; resolve against its origin. */
export const resolveDareMediaUrl = (path: string): string =>
  new URL(path, `${socketConfig.baseUrl}/`).toString();

/** Images DARE persisted on a message; generated images are a different feature. */
export function messageImagesFromFiles(files?: SocketFile[] | null): MessageImage[] | undefined {
  if (!Array.isArray(files)) return undefined;
  const images = files
    .filter(file => file.mediaType === 'image' && !file.isGenerated && file.file)
    .map(file => ({
      id: String(file.id),
      url: resolveDareMediaUrl(file.file),
      name: file.name ?? 'image',
    }));
  return images.length > 0 ? images : undefined;
}
