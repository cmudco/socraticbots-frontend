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
  targetName: string;
  targetType: string;
  redeemedAt: string;
  accessCodeCreatedAt: string;
}

export interface MyAccessCodesResponse {
  redeemedCodes: RedeemedAccessCode[];
  totalCount: number;
}

class AccessCodeService {
  async redeemAccessCode(accessCode: string): Promise<RedeemAccessCodeResponse> {
    return baseRequest<RedeemAccessCodeResponse>({
      url: 'access-codes/redeem/',
      method: METHOD.POST,
      data: { access_code: accessCode },
    });
  }

  async getMyAccessCodes(): Promise<MyAccessCodesResponse> {
    return baseRequest<MyAccessCodesResponse>({
      url: 'access-codes/my-list/',
      method: METHOD.GET,
    });
  }
}

export const accessCodeService = new AccessCodeService();
