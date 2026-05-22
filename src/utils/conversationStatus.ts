import { ConversationStatus } from '@/types/voiceAgent';

const CONVERSATION_STATUS_STYLES: Record<ConversationStatus, string> = {
  [ConversationStatus.Reserved]: 'bg-muted text-muted-foreground',
  [ConversationStatus.Completed]:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [ConversationStatus.InProgress]:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [ConversationStatus.Failed]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [ConversationStatus.Cancelled]: 'bg-muted text-muted-foreground',
};

export const getConversationStatusStyle = (status: ConversationStatus) =>
  CONVERSATION_STATUS_STYLES[status];

export const formatConversationStatus = (status: ConversationStatus) => status.replace('_', ' ');
