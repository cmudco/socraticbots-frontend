import { Bot, Home, Key, type LucideIcon, MessageCircle, Settings, Users } from 'lucide-react';

interface NavigationItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: ('student' | 'creator')[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    path: '/',
    label: 'Home',
    icon: Home,
  },
  // {
  //   path: '/about',
  //   label: 'About',
  //   icon: Info,
  // },
  {
    path: '/access-codes',
    label: 'Access Codes',
    icon: Key,
  },
  {
    path: '/bot-groups',
    label: 'Chatbot Groups',
    icon: Bot,
  },
  {
    path: '/bot-access',
    label: 'Bot Access',
    icon: Users,
    roles: ['creator'],
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

export const getNavigationItemsForRole = (isCreator: boolean): NavigationItem[] => {
  const userRole = isCreator ? 'creator' : 'student';

  return NAVIGATION_ITEMS.filter(item => !item.roles || item.roles.includes(userRole));
};
