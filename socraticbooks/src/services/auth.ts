import { auth } from '../config/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    User 
} from 'firebase/auth';
import { useState, useEffect } from 'react';

export const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const register = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
    return signOut(auth);
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    return user;
};
