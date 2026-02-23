/**
 * Shared formatting utilities for dates, times, and labels
 */

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getAccessTypeLabel = (accessType: string): string => {
  const labels: Record<string, string> = {
    direct_bot: 'Direct Bot Access',
    bot_group: 'Bot Group Access',
    bot_group_owner: 'Bot Group Owner',
    bot_group_collaborator: 'Bot Group Collaborator',
    bot_creator: 'Bot Creator',
  };
  return labels[accessType] || accessType;
};
