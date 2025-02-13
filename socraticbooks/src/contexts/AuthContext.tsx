import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../services/auth';

const AuthContext = createContext<ReturnType<typeof useAuth>>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
