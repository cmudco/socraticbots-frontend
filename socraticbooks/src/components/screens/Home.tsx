import React from 'react';
import { getUserAffiliation } from '../../services/user';
import { useAuthContext } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';

const Home: React.FC = () => {
    const user = useAuthContext();
    const [affiliation, setAffiliation] = useState<string | null>(null);

    useEffect(() => {
            if (user) {
                getUserAffiliation(user.uid)
                    .then(setAffiliation)
                    .catch(err => console.error('Failed to get affiliation:', err));
            }
        }, [user]);

    return (
        <div className="">
            <h1 className="font-bold text-socratic-fontdark text-socratic-4xl">Welcome to Socratic Books</h1>
            <p className="text-socratic-l">You are registered as a {affiliation}.</p>
        </div>
    );
};

export default Home;
