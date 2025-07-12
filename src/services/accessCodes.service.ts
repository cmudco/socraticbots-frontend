// src/services/accessCodes.service.ts
import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

export interface RedeemAccessCodeRequest {
  access_code: string;
}

export interface RedeemAccessCodeResponse {
  message: string;
  target_name: string;
  target_type: string;
  redeemed_at: string;
}

export interface RedeemedAccessCode {
  code: string;
  target_name: string;
  target_type: string;
  redeemed_at: string;
  access_code_created_at: string;
}

export interface StudentAccessCodesResponse {
  redeemed_codes: RedeemedAccessCode[];
  total_count: number;
}

class AccessCodeService {
  // Redeem an access code for a student
  async redeemAccessCode(accessCode: string): Promise<RedeemAccessCodeResponse> {
    return baseRequest<RedeemAccessCodeResponse>({
      url: 'access-codes/redeem/',
      method: METHOD.POST,
      data: { access_code: accessCode },
    });
  }

  // Get list of redeemed access codes for a student
  async getStudentAccessCodes(): Promise<StudentAccessCodesResponse> {
    return baseRequest<StudentAccessCodesResponse>({
      url: 'access-codes/student-list/',
      method: METHOD.GET,
    });
  }
}

export const accessCodeService = new AccessCodeService();
