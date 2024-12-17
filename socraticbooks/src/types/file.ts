// src/types/file.ts
export interface ChapterFile {
    id: string;
    chapterId: string;
    name: string;
    type: string;
    size: number;
    url: string;
    storageUrl: string;
    createdAt: Date;
    updatedAt: Date;
    description?: string;
  }