// src/types/navigation.ts
import { FaBook, FaCog, FaComment, FaHome, FaInfoCircle } from 'react-icons/fa';
import { IconType } from 'react-icons/lib';

interface NavigationItem {
  path: string;
  label: string;
  icon: IconType;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    path: '/',
    label: 'Home',
    icon: FaHome,
  },
  {
    path: '/about',
    label: 'About',
    icon: FaInfoCircle,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: FaCog,
  },
  {
    path: '/books',
    label: 'Books',
    icon: FaBook,
  },
  {
    path: '/chat',
    label: 'Chat',
    icon: FaComment,
  },
];
