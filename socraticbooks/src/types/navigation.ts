export interface NavigationItem {
    path: string;
    label: string;
    requiresAuth?: boolean;
    requiredAffiliation?: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
    {
        path: '/',
        label: 'Home',
        requiresAuth: true
    },
    {
        path: '/books',
        label: 'Books',
        requiresAuth: true,
        requiredAffiliation: 'professor'
    },
    {
        path: '/login',
        label: 'Login',
        requiresAuth: false
    },
    {
        path: '/register',
        label: 'Register',
        requiresAuth: false
    },
    {
        path: '/settings',
        label: 'Settings',
        requiresAuth: true  
    }
];
