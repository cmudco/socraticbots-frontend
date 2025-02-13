import { useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { getUserAffiliation } from '../../services/user';

const Settings = () => {
    const user = useAuthContext();
    const [affiliation, setAffiliation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getUserAffiliation(user.uid)
                .then(setAffiliation)
                .catch(err => console.error('Failed to get affiliation:', err))
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>
                
                {/* Profile Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Profile</h2>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <span className="w-32 text-gray-600">Email:</span>
                            <span>{user?.email}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-32 text-gray-600">Role:</span>
                            <span className="capitalize">
                                {isLoading ? (
                                    <span className="text-gray-400">Loading...</span>
                                ) : (
                                    affiliation || 'Not set'
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                    <div className="space-y-4">
                        {/* Add preference toggles/options here */}
                        <div className="flex items-center">
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
