// src/types/file.ts
export interface ChapterFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  vectorized?: boolean;
}