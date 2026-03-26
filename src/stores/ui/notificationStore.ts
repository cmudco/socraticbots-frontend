/**
 * Notification Store - Zustand store for notification state management
 */
import { create } from 'zustand';

import { notificationService } from '@/services/notification.service';

import type { Notification, NotificationStats } from '@/types/notification';
import { NotificationDeliveryType, NotificationStatus } from '@/types/notification';

interface NotificationState {
  notifications: Notification[];
  stats: NotificationStats | null;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  fetchStats: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  stats: null,
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await notificationService.getNotifications();
      const notifications = response.results || [];

      // Filter panel notifications and count unread
      const panelNotifications = notifications.filter(
        n => n.deliveryType === NotificationDeliveryType.PANEL
      );
      const unreadCount = panelNotifications.filter(
        n => n.effectiveStatus === NotificationStatus.UNREAD
      ).length;

      set({
        notifications,
        unreadCount,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await notificationService.getNotificationStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
    }
  },

  markAsRead: async (id: number) => {
    // Optimistic update
    const prevNotifications = get().notifications;
    const prevUnreadCount = get().unreadCount;

    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, effectiveStatus: NotificationStatus.READ } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      // Revert on failure
      console.error('Failed to mark notification as read:', error);
      set({
        notifications: prevNotifications,
        unreadCount: prevUnreadCount,
        error: 'Failed to mark notification as read',
      });
    }
  },

  markAllAsRead: async () => {
    const prevNotifications = get().notifications;
    const prevUnreadCount = get().unreadCount;

    // Optimistic update
    set(state => ({
      notifications: state.notifications.map(n => ({
        ...n,
        effectiveStatus: NotificationStatus.READ,
      })),
      unreadCount: 0,
    }));

    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      // Revert on failure
      console.error('Failed to mark all notifications as read:', error);
      set({
        notifications: prevNotifications,
        unreadCount: prevUnreadCount,
        error: 'Failed to mark all notifications as read',
      });
    }
  },

  clearAll: async () => {
    const prevNotifications = get().notifications;

    // Optimistic update
    set({
      notifications: [],
      unreadCount: 0,
    });

    try {
      await notificationService.clearAll();
    } catch (error) {
      // Revert on failure
      console.error('Failed to clear notifications:', error);
      set({
        notifications: prevNotifications,
        error: 'Failed to clear notifications',
      });
      // Re-fetch to get accurate state
      get().fetchNotifications();
    }
  },

  clearError: () => set({ error: null }),
}));
