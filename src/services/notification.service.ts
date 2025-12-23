/**
 * Notification Service - API calls to SB backend proxy for notifications
 */
import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import type {
  Notification,
  NotificationStats,
  PaginatedNotificationResponse,
} from '@/types/notification';

interface GetNotificationsParams {
  status?: string;
  exclude_expired?: boolean;
}

class NotificationService {
  /**
   * Get notifications for the current user
   */
  async getNotifications(params?: GetNotificationsParams): Promise<PaginatedNotificationResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.exclude_expired !== undefined) {
      queryParams.append('exclude_expired', params.exclude_expired.toString());
    }

    const url = `users/notifications/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return baseRequest<PaginatedNotificationResponse>({
      url,
      method: METHOD.GET,
    });
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    return baseRequest<NotificationStats>({
      url: 'users/notifications/stats/',
      method: METHOD.GET,
    });
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(
    notificationId: number
  ): Promise<{ message: string; notification: Notification }> {
    return baseRequest<{ message: string; notification: Notification }>({
      url: `users/notifications/${notificationId}/mark-read/`,
      method: METHOD.POST,
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string; updated_count: number }> {
    return baseRequest<{ message: string; updated_count: number }>({
      url: 'users/notifications/mark-all-read/',
      method: METHOD.POST,
    });
  }

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<{ message: string; cleared_count: number }> {
    return baseRequest<{ message: string; cleared_count: number }>({
      url: 'users/notifications/clear-all/',
      method: METHOD.DELETE,
    });
  }
}

export const notificationService = new NotificationService();
