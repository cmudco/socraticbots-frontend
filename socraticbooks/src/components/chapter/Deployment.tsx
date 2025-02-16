import React, { useState, useEffect } from 'react';
import { 
    getChapterPublicId, 
    regenerateChapterPublicId,
    getChapterPublishedStatus,
    updateChapterPublishedStatus
} from '../../services/chaptersService';

interface DeploymentProps {
    chapterId: string;
}

const Deployment: React.FC<DeploymentProps> = ({ chapterId }) => {
    const [isPublished, setIsPublished] = useState(false);
    const [publicId, setPublicId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [chapterId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [id, publishedStatus] = await Promise.all([
                getChapterPublicId(chapterId),
                getChapterPublishedStatus(chapterId)
            ]);
            setPublicId(id);
            setIsPublished(publishedStatus);
            setError(null);
        } catch (err) {
            setError('Failed to fetch chapter data');
            console.error('Error fetching chapter data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateId = async () => {
        if (window.confirm('Are you sure you want to generate a new public ID? Old links will no longer work.')) {
            try {
                setIsLoading(true);
                const newId = await regenerateChapterPublicId(chapterId);
                setPublicId(newId);
                setError(null);
            } catch (err) {
                setError('Failed to regenerate public ID');
                console.error('Error regenerating public ID:', err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handlePublish = async () => {
        const newState = !isPublished;
        let shouldProceed = false;

        if (newState) { // Publishing
            shouldProceed = window.confirm(
                'Are you sure you want to publish this chapter?\n\n' +
                'This will make it available to students with access.'
            );
        } else { // Unpublishing
            shouldProceed = window.confirm(
                'Are you sure you want to unpublish this chapter?\n\n' +
                'This will remove access for all students.\n' +
                'Their progress will be preserved but they cannot access the chapter until republished.'
            );
        }

        if (shouldProceed) {
            try {
                const updated = await updateChapterPublishedStatus(chapterId, newState);
                setIsPublished(updated);
            } catch (err) {
                setError('Failed to update published status');
                console.error('Error updating published status:', err);
            }
        }
    };

    if (isLoading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 py-4">{error}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Deployment Settings</h3>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">Public ID</div>
                            <div className="text-sm text-gray-500">{publicId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button 
                                onClick={handleRegenerateId}
                                className="text-socratic hover:text-socratic-dark text-sm"
                            >
                                Generate New
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">Published Status</div>
                            <div className="text-sm text-gray-500">
                                {isPublished ? 'Published' : 'Draft'}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div onClick={handlePublish} 
                                className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                                <input 
                                    type="checkbox"
                                    className="absolute w-0 h-0 opacity-0"
                                    checked={isPublished}
                                    readOnly
                                />
                                <div className={`block w-12 h-6 rounded-full ${isPublished ? 'bg-socratic' : 'bg-gray-300'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${isPublished ? 'transform translate-x-6' : ''}`}></div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Deployment;
