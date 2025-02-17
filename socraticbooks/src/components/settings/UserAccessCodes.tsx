// src/components/settings/UserAccessCodes.tsx
import React, { useState, useEffect } from 'react';
import { 
    getAllUserAccessCodes, 
    addAdditionalAccessCode, 
    removeAdditionalAccessCode,
    UserAccessCode 
} from '../../services/userAccessCodesLink';
import { useAuthContext } from '../../contexts/AuthContext';

const UserAccessCodes: React.FC = () => {
    const user = useAuthContext();
    const [accessCodes, setAccessCodes] = useState<UserAccessCode[]>([]);
    const [newAccessCode, setNewAccessCode] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchAccessCodes = async () => {
        if (!user) return;
        
        try {
            setIsLoading(true);
            const codes = await getAllUserAccessCodes(user.uid);
            setAccessCodes(codes);
            setError(null);
        } catch (err) {
            setError('Failed to fetch access codes');
            console.error('Error fetching access codes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccessCodes();
    }, [user]);

    const handleAddAccessCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newAccessCode.trim()) return;

        try {
            await addAdditionalAccessCode(user.uid, newAccessCode.trim().toUpperCase());
            setNewAccessCode('');
            setSuccessMessage('Access code added successfully');
            await fetchAccessCodes();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add access code');
        }
    };

    const handleRemoveAccessCode = async (accessCode: string) => {
        if (!user) return;

        try {
            await removeAdditionalAccessCode(user.uid, accessCode);
            setSuccessMessage('Access code removed successfully');
            await fetchAccessCodes();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove access code');
        }
    };

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Access Codes</h2>
            
            {/* Add new access code form */}
            <form onSubmit={handleAddAccessCode} className="space-y-2">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newAccessCode}
                        onChange={(e) => setNewAccessCode(e.target.value.toUpperCase())}
                        placeholder="Enter access code"
                        className="flex-1 p-2 border rounded focus:ring-socratic focus:border-socratic"
                    />
                    <button
                        type="submit"
                        disabled={!newAccessCode.trim()}
                        className="px-4 py-2 bg-socratic text-white rounded hover:bg-socratic-dark disabled:opacity-50"
                    >
                        Add Code
                    </button>
                </div>
            </form>

            {/* Status messages */}
            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}
            {successMessage && (
                <div className="text-green-500 text-sm">{successMessage}</div>
            )}

            {/* Access codes list */}
            {isLoading ? (
                <div className="text-gray-500">Loading access codes...</div>
            ) : (
                <div className="space-y-2">
                    {accessCodes.map((code) => (
                        <div 
                            key={code.id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded"
                        >
                            <div>
                                <span className="font-medium">{code.access_code}</span>
                                {code.is_registration_code && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        Registration Code
                                    </span>
                                )}
                                <div className="text-sm text-gray-500">{code.description}</div>
                            </div>
                            {!code.is_registration_code && (
                                <button
                                    onClick={() => handleRemoveAccessCode(code.access_code)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserAccessCodes;
