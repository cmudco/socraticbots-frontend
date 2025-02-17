// src/components/chapter/ChapterAccessCodes.tsx
import { useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { AccessCode, getUserAccessCodes } from '../../services/userAccessCodes';
import { 
    addAccessCodeToChapter, 
    removeAccessCodeFromChapter,
    getChapterAccessCodes,
    ChapterAccessCode 
} from '../../services/chapterAccessCodes';

interface ChapterAccessCodesProps {
    chapterId: string;
}

const ChapterAccessCodes: React.FC<ChapterAccessCodesProps> = ({ chapterId }) => {
    const user = useAuthContext();
    const [availableAccessCodes, setAvailableAccessCodes] = useState<AccessCode[]>([]);
    const [chapterAccessCodes, setChapterAccessCodes] = useState<ChapterAccessCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch both available access codes and currently assigned ones
    const fetchData = async () => {
        if (!user) return;
        
        try {
            setIsLoading(true);
            const [userCodes, chapterCodes] = await Promise.all([
                getUserAccessCodes(user.uid),
                getChapterAccessCodes(chapterId)
            ]);
            setAvailableAccessCodes(userCodes);
            setChapterAccessCodes(chapterCodes);
            setError(null);
        } catch (err) {
            setError('Failed to fetch access codes');
            console.error('Error fetching access codes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [chapterId, user]);

    const handleAddAccessCode = async (accessCodeId: number) => {
        if (!user) return;
        
        try {
            await addAccessCodeToChapter(chapterId, accessCodeId, user.uid);
            await fetchData(); // Refresh the lists
        } catch (err) {
            setError('Failed to add access code');
            console.error('Error adding access code:', err);
        }
    };

    const handleRemoveAccessCode = async (accessCodeId: number) => {
        if (!user) return;
        
        try {
            await removeAccessCodeFromChapter(chapterId, accessCodeId, user.uid);
            await fetchData(); // Refresh the lists
        } catch (err) {
            setError('Failed to remove access code');
            console.error('Error removing access code:', err);
        }
    };

    if (isLoading) {
        return <div className="text-center py-4">Loading access codes...</div>;
    }

    if (error) {
        return <div className="text-red-500 py-4">{error}</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Chapter Access Codes</h3>
            
            {/* Available Access Codes Dropdown */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Access Code
                </label>
                <select 
                    className="w-full p-2 border rounded focus:ring-socratic focus:border-socratic"
                    onChange={(e) => {
                        const id = parseInt(e.target.value);
                        if (id) handleAddAccessCode(id);
                        e.target.value = ''; // Reset after selection
                    }}
                    defaultValue=""
                >
                    <option value="" disabled>Select an access code</option>
                    {availableAccessCodes
                        .filter(code => !chapterAccessCodes.some(cc => cc.id === code.id))
                        .map(code => (
                            <option key={code.id} value={code.id}>
                                {code.access_code} - {code.description}
                            </option>
                        ))
                    }
                </select>
            </div>

            {/* Current Access Codes List */}
            <div>
                <h4 className="text-md font-medium mb-2">Current Access Codes</h4>
                {chapterAccessCodes.length === 0 ? (
                    <p className="text-gray-500">No access codes assigned to this chapter</p>
                ) : (
                    <div className="space-y-2">
                        {chapterAccessCodes.map(code => (
                            <div 
                                key={code.id}
                                className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                                <div>
                                    <span className="font-medium">{code.access_code}</span>
                                    <span className="text-gray-600 ml-2">- {code.description}</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveAccessCode(code.id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChapterAccessCodes;
