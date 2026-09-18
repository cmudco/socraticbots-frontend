/** Images a user attaches to a chat turn, mirroring DARE's chat composer. */

export const MAX_ATTACHED_IMAGES = 6;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** An image staged in the composer; `preview` is a data URL. */
export interface AttachedImage {
  id: string;
  preview: string;
  name: string;
  size: number;
  type: string;
}

/** Wire shape DARE's `send_message` accepts; DARE stores each as a message file. */
export interface ImagePayload {
  preview: string;
  name: string;
  type: string;
}

/** An image DARE persisted on a message, resolved to a loadable URL. */
export interface MessageImage {
  id: string;
  url: string;
  name: string;
}

/** A file entry on DARE's camelized message payloads (live echo and history). */
export interface SocketFile {
  id: number | string;
  file: string;
  name?: string | null;
  mediaType?: string | null;
  isGenerated?: boolean;
}
