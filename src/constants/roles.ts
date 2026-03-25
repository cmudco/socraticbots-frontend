export const PlatformRole = {
  SUPERADMIN: 'SUPERADMIN',
  RESEARCHER: 'RESEARCHER',
  USER: 'USER',
  CREATOR: 'CREATOR',
  SB_USER: 'SB_USER',
  SUPERVISOR: 'SUPERVISOR',
} as const;

export type PlatformRole = (typeof PlatformRole)[keyof typeof PlatformRole];
