/**
 * Types for bot access management
 */

export interface UserAccessInfo {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  accessType: string;
  accessCode: string;
  accessGrantedAt: string;
  isCreator?: boolean;
}
