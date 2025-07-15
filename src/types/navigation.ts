// src/types/navigation.ts
import { Book, Home, Info, Key, type LucideIcon, MessageCircle, Settings } from 'lucide-react';

interface NavigationItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: ('student' | 'professor')[]; // If undefined, available to all roles
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    path: '/',
    label: 'Home',
    icon: Home,
  },
  {
    path: '/about',
    label: 'About',
    icon: Info,
  },
  {
    path: '/access-codes',
    label: 'Access Codes',
    icon: Key,
    roles: ['student'], // Only show to students
  },
  {
    path: '/books',
    label: 'Books',
    icon: Book,
  },
  {
    path: '/chat',
    label: 'Chat',
    icon: MessageCircle,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

// Helper function to filter navigation items based on user role
export const getNavigationItemsForRole = (isProfessor: boolean): NavigationItem[] => {
  const userRole = isProfessor ? 'professor' : 'student';

  return NAVIGATION_ITEMS.filter(item => !item.roles || item.roles.includes(userRole));
};
