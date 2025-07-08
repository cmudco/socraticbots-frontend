// src/services/accessCodes.service.ts
import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

export interface AccessCode {
  code: string;
  target_name: string;
  target_type: string;
  created_at: string;
}

export interface GenerateAccessCodeRequest {
  chapter_id: string;
}

class AccessCodeService {
  // Generate an access code for a chapter
  async generateAccessCode(chapterId: string): Promise<AccessCode> {
    return baseRequest<AccessCode>({
      url: 'access-codes/generate/',
      method: METHOD.POST,
      data: { chapter_id: chapterId },
    });
  }
}

// Export a singleton instance
export const accessCodeService = new AccessCodeService();
