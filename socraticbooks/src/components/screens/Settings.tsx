import { useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { getUserAffiliation } from '../../services/user';
import UserAccessCodes from '../settings/UserAccessCodes';

interface ThemeColors {
    light: string;
    DEFAULT: string;
    dark: string;
    fontLight: string;
    fontDark: string;
}

const defaultColors: ThemeColors = {
    light: '#6B46C1',    // Dark purple
    DEFAULT: '#553C9A',  // Deep purple
    dark: '#44337A',     // Very deep purple
    fontLight: '#E2E8F0', // Ice gray light
    fontDark: '#1A202C'   // Very deep gray
};

const Settings = () => {
    const user = useAuthContext();
    const [affiliation, setAffiliation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [colors, setColors] = useState<ThemeColors>(defaultColors);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getUserAffiliation(user.uid)
                .then(setAffiliation)
                .catch(err => console.error('Failed to get affiliation:', err))
                .finally(() => setIsLoading(false));
        }

        // Load saved colors from localStorage
        const savedColors = localStorage.getItem('theme-colors');
        if (savedColors) {
            setColors(JSON.parse(savedColors));
            applyColors(JSON.parse(savedColors));
        }
    }, [user]);

    const applyColors = (newColors: ThemeColors) => {
        document.documentElement.style.setProperty('--color-socratic-light', newColors.light);
        document.documentElement.style.setProperty('--color-socratic', newColors.DEFAULT);
        document.documentElement.style.setProperty('--color-socratic-dark', newColors.dark);
        document.documentElement.style.setProperty('--color-socratic-font-light', newColors.fontLight);
        document.documentElement.style.setProperty('--color-socratic-font-dark', newColors.fontDark);
    };

    const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
        const newColors = { ...colors, [colorKey]: value };
        setColors(newColors);
        applyColors(newColors);
        localStorage.setItem('theme-colors', JSON.stringify(newColors));
    };

    const resetColors = () => {
        setColors(defaultColors);
        applyColors(defaultColors);
        localStorage.setItem('theme-colors', JSON.stringify(defaultColors));
    };

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


                {/* Access Codes Section */}
                <UserAccessCodes />

                {/* Theme Colors Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Theme Colors</h2>
                    <div className="space-y-4">
                        {Object.entries(colors).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-4">
                                <span className="w-32 text-gray-600 capitalize">
                                    {key === 'DEFAULT' ? 'Primary' : key}:
                                </span>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="color"
                                        value={value}
                                        onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                                        className="px-2 py-1 border rounded w-28"
                                    />
                                    <div 
                                        className="w-12 h-8 rounded border"
                                        style={{ backgroundColor: value }}
                                    />
                                </div>
                            </div>
                        ))}
                        
                        <div className="mt-6">
                            <button
                                onClick={resetColors}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                            >
                                Reset to Defaults
                            </button>
                        </div>

                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
