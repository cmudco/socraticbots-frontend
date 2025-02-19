// src/types/navigation.ts
import { IconType } from 'react-icons';
import { 
    FaHome, 
    FaBook, 
    FaSignInAlt, 
    FaUserPlus, 
    FaKey, 
    FaComments, 
    FaCog 
} from 'react-icons/fa';

export interface NavigationItem {
    path: string;
    label: string;
    icon: IconType;  // Add icon property
    requiresAuth?: boolean;
    requiredAffiliation?: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
    {
        path: '/',
        label: 'Home',
        icon: FaHome,
        requiresAuth: true
    },
    {
        path: '/books',
        label: 'Books',
        icon: FaBook,
        requiresAuth: true,
        requiredAffiliation: 'professor'
    },
    {
        path: '/login',
        label: 'Login',
        icon: FaSignInAlt,
        requiresAuth: false
    },
    {
        path: '/register',
        label: 'Register',
        icon: FaUserPlus,
        requiresAuth: false
    },
    {
        path: '/access-codes',
        label: 'Access Codes',
        icon: FaKey,
        requiresAuth: true,
        requiredAffiliation: 'professor'
    },
    {
        path: '/chat',
        label: 'Chat',
        icon: FaComments,
        requiresAuth: true
    },
    {
        path: '/settings',
        label: 'Settings',
        icon: FaCog,
        requiresAuth: true  
    }
];
