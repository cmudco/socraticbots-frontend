import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/auth';
import { 
    getUserAccessCodes, 
    createAccessCode, 
    generateRandomAccessCode,
    updateAccessCodeStatus,
    AccessCode 
} from '../../services/userAccessCodes';
import CreateAccessCodeModal from '../modals/CreateAccessCodeModal';
import { Switch, Button } from '@mui/material';

const AccessCodes: React.FC = () => {
    const user = useAuth();
    const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (user?.uid) {
            fetchAccessCodes();
        }
    }, [user]);

    const fetchAccessCodes = async () => {
        if (!user?.uid) return;
        
        try {
            setIsLoading(true);
            const codes = await getUserAccessCodes(user.uid);
            setAccessCodes(codes);
            setError(null);
        } catch (err) {
            setError('Failed to fetch access codes');
            console.error('Error fetching access codes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusToggle = async (codeId: number, currentStatus: boolean) => {
        if (!user?.uid) return;

        try {
            await updateAccessCodeStatus(user.uid, codeId, !currentStatus);
            setAccessCodes(codes => 
                codes.map(code => 
                    code.id === codeId 
                        ? { ...code, is_active: !currentStatus }
                        : code
                )
            );
        } catch (err) {
            setError('Failed to update access code status');
            console.error('Error updating access code status:', err);
        }
    };

    const handleCreateCode = async (data: {
        access_code: string;
        description: string;
        is_active: boolean;
        contact_andrew?: string;
    }) => {
        if (!user?.uid) return;

        try {
            const createdCode = await createAccessCode(user.uid, data);
            setAccessCodes([createdCode, ...accessCodes]);
            setError(null);
            setIsModalOpen(false);
        } catch (err) {
            setError('Failed to create access code');
            console.error('Error creating access code:', err);
        }
    };

    if (!user) {
        return <div className="text-center py-4">Please log in to view access codes.</div>;
    }

    if (isLoading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Access Codes</h1>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Create New Access Code
                    </Button>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    {accessCodes.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                            No access codes created yet
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Access Code
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact Andrew
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {accessCodes.map((code) => (
                                    <tr key={code.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                            {code.access_code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {code.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {code.contact_andrew || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                code.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {code.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(code.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Switch
                                                checked={code.is_active}
                                                onChange={() => handleStatusToggle(code.id, code.is_active)}
                                                color="primary"
                                                size="small"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <CreateAccessCodeModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateCode}
                onGenerateCode={() => generateRandomAccessCode(8)}
            />
        </div>
    );
};

export default AccessCodes;
