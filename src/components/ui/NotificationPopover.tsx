/**
 * NotificationPopover - Notification bell with dropdown popover
 * Adapted from DARE's NotificationPopover with Zustand instead of Redux
 */
import React, { useEffect } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, AlertTriangle, Bell, Check, Info, Trash2 } from 'lucide-react';

import { useNotificationStore } from '@/stores/ui/notificationStore';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import {
  NotificationCategory,
  NotificationDeliveryType,
  NotificationStatus,
} from '@/types/notification';

/**
 * Format notification date to relative time (e.g., "2 hours ago")
 */
const formatNotificationDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Unknown time';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
};

interface NotificationPopoverProps {
  className?: string;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({ className }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotificationStore();

  // Filter panel notifications
  const panelNotifications = notifications.filter(
    notification => notification.deliveryType === NotificationDeliveryType.PANEL
  );

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAll();
  };

  const getNotificationIcon = (category: NotificationCategory) => {
    switch (category) {
      case NotificationCategory.DESTRUCTIVE:
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case NotificationCategory.WARNING:
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case NotificationCategory.SUCCESS:
        return <AlertCircle className="h-3 w-3 text-green-500" />;
      case NotificationCategory.INFO:
        return <Info className="h-3 w-3 text-blue-500" />;
      default:
        return <Info className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('hover:bg-accent relative', className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs font-medium"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {panelNotifications.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
              >
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="border-t" />

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
              <p className="text-muted-foreground mt-2 text-sm">Loading...</p>
            </div>
          ) : panelNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="text-muted-foreground/50 mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">No notifications</p>
              <p className="text-muted-foreground/70 mt-1 text-xs">You're all caught up!</p>
            </div>
          ) : (
            <div className="py-1">
              {panelNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    'group hover:bg-accent/50 relative cursor-pointer px-4 py-3 transition-colors',
                    notification.effectiveStatus === NotificationStatus.UNREAD &&
                      'bg-blue-50/30 dark:bg-blue-950/10'
                  )}
                  onClick={() => {
                    if (notification.actionUrl) {
                      window.open(notification.actionUrl, '_blank');
                    }
                    if (notification.effectiveStatus === NotificationStatus.UNREAD) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  {notification.effectiveStatus === NotificationStatus.UNREAD && (
                    <div className="absolute top-1/2 left-2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-blue-500" />
                  )}

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {getNotificationIcon(notification.category)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="line-clamp-1 text-sm leading-tight font-medium">
                          {notification.title}
                        </p>
                        {notification.effectiveStatus === NotificationStatus.UNREAD && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={e => handleMarkAsRead(e, notification.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {notification.message !== notification.title && (
                        <p className="text-muted-foreground mb-2 line-clamp-2 text-xs">
                          {notification.message}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground/70 text-xs">
                            {formatNotificationDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {index < panelNotifications.length - 1 && <div className="mt-3 border-t" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;
