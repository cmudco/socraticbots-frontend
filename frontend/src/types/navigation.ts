// src/types/navigation.ts
import { IconType } from 'react-icons/lib';
import { FaHome, FaInfoCircle, FaCog, FaBook, FaComment } from 'react-icons/fa';

interface NavigationItem {
    path: string;
    label: string;
    icon: IconType;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
    {
        path: '/',
        label: 'Home',
        icon: FaHome
    },
    {
        path: '/about',
        label: 'About',
        icon: FaInfoCircle
    },
    {
        path: '/settings',
        label: 'Settings',
        icon: FaCog
    },
    {
        path: '/books',
        label: 'Books',
        icon: FaBook
    },
    {
        path: '/chat',
        label: 'Chat',
        icon: FaComment
    },
];
