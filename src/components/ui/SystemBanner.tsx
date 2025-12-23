/**
 * SystemBanner - Banner notification component for system-wide announcements
 * Adapted from DARE's SystemBanner with Zustand instead of Redux
 */
import React, { useEffect, useState } from 'react';

import { AlertCircle, AlertTriangle, ChevronLeft, ChevronRight, Info, X } from 'lucide-react';

import { useNotificationStore } from '@/stores/ui/notificationStore';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import {
  NotificationCategory,
  NotificationDeliveryType,
  NotificationStatus,
} from '@/types/notification';

interface SystemBannerProps {
  className?: string;
}

const SystemBanner: React.FC<SystemBannerProps> = ({ className }) => {
  const { notifications, markAsRead } = useNotificationStore();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [dismissedBannerIds, setDismissedBannerIds] = useState<Set<number>>(new Set());

  const bannerNotifications = notifications.filter(
    notification =>
      notification.deliveryType === NotificationDeliveryType.BANNER &&
      notification.effectiveStatus === NotificationStatus.UNREAD &&
      !notification.isExpired &&
      !dismissedBannerIds.has(notification.id)
  );

  const bannerNotification = bannerNotifications[currentBannerIndex];

  useEffect(() => {
    if (currentBannerIndex >= bannerNotifications.length && bannerNotifications.length > 0) {
      setCurrentBannerIndex(0);
    }
  }, [bannerNotifications.length, currentBannerIndex]);

  useEffect(() => {
    const currentBannerIds = new Set(
      notifications
        .filter(
          n =>
            n.deliveryType === NotificationDeliveryType.BANNER &&
            n.effectiveStatus === NotificationStatus.UNREAD &&
            !n.isExpired
        )
        .map(n => n.id)
    );

    setDismissedBannerIds(prev => {
      const newDismissedIds = new Set<number>();
      prev.forEach(id => {
        if (currentBannerIds.has(id)) {
          newDismissedIds.add(id);
        }
      });
      return newDismissedIds;
    });
  }, [notifications]);

  if (!bannerNotification || bannerNotifications.length === 0) {
    return null;
  }

  const hasMultipleBanners = bannerNotifications.length > 1;

  const goToPreviousBanner = () => {
    setCurrentBannerIndex(prev => (prev > 0 ? prev - 1 : bannerNotifications.length - 1));
  };

  const goToNextBanner = () => {
    setCurrentBannerIndex(prev => (prev < bannerNotifications.length - 1 ? prev + 1 : 0));
  };

  const getIcon = () => {
    const iconClass = 'h-4 w-4 flex-shrink-0';
    switch (bannerNotification.category) {
      case NotificationCategory.DESTRUCTIVE:
        return <AlertCircle className={iconClass} />;
      case NotificationCategory.WARNING:
        return <AlertTriangle className={iconClass} />;
      case NotificationCategory.SUCCESS:
        return <AlertCircle className={iconClass} />;
      case NotificationCategory.INFO:
        return <Info className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  const getBannerClasses = () => {
    const baseClasses = 'w-full px-4 py-2.5 flex items-center gap-3 text-sm border-b shadow-sm';

    switch (bannerNotification.category) {
      case NotificationCategory.DESTRUCTIVE:
        return cn(
          baseClasses,
          'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900 dark:text-red-200'
        );
      case NotificationCategory.WARNING:
        return cn(
          baseClasses,
          'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-900 dark:text-yellow-200'
        );
      case NotificationCategory.SUCCESS:
        return cn(
          baseClasses,
          'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-900 dark:text-green-200'
        );
      case NotificationCategory.INFO:
        return cn(
          baseClasses,
          'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-200'
        );
      default:
        return cn(
          baseClasses,
          'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/30 dark:border-gray-800 dark:text-gray-200'
        );
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedBannerIds(prev => new Set(prev).add(bannerNotification.id));
    markAsRead(bannerNotification.id);

    if (bannerNotifications.length > 1) {
      if (currentBannerIndex >= bannerNotifications.length - 1) {
        setCurrentBannerIndex(Math.max(0, currentBannerIndex - 1));
      }
    }
  };

  const handleClick = () => {
    if (bannerNotification.actionUrl) {
      window.open(bannerNotification.actionUrl, '_blank');
    }
    markAsRead(bannerNotification.id);
  };

  return (
    <div className={cn(getBannerClasses(), className)}>
      {/* Icon */}
      {getIcon()}

      {/* Navigation - Previous */}
      {hasMultipleBanners && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
          onClick={goToPreviousBanner}
          aria-label="Previous banner"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Content */}
      <div
        className={cn(
          'min-w-0 flex-1',
          bannerNotification.actionUrl && 'cursor-pointer hover:underline'
        )}
        onClick={handleClick}
      >
        <span className="font-medium">{bannerNotification.title}</span>
        {bannerNotification.message !== bannerNotification.title && (
          <span className="ml-2 opacity-90">{bannerNotification.message}</span>
        )}
      </div>

      {/* Counter */}
      {hasMultipleBanners && (
        <span className="flex-shrink-0 text-xs opacity-70">
          {currentBannerIndex + 1} / {bannerNotifications.length}
        </span>
      )}

      {/* Navigation - Next */}
      {hasMultipleBanners && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
          onClick={goToNextBanner}
          aria-label="Next banner"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Dismiss */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 flex-shrink-0 p-0 hover:bg-black/10 dark:hover:bg-white/10"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SystemBanner;
