import type { VoiceAccessLevel } from '@/types/voiceAgent';

export const ROLE_BADGE_STYLES: { [K in VoiceAccessLevel]: string } = {
  supervisor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  owner: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  manager: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  reviewer: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  student: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};
