import React, { useState, useEffect } from 'react';
import { getChapterPublicId, regenerateChapterPublicId } from '../../services/chaptersService';

interface DeploymentProps {
    chapterId: string;
}

const Deployment: React.FC<DeploymentProps> = ({ chapterId }) => {
    const [isPublished, setIsPublished] = useState(false);
    const [publicId, setPublicId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPublicId();
    }, [chapterId]);

    const fetchPublicId = async () => {
        try {
            setIsLoading(true);
            const id = await getChapterPublicId(chapterId);
            setPublicId(id);
            setError(null);
        } catch (err) {
            setError('Failed to fetch public ID');
            console.error('Error fetching public ID:', err);
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

    const handlePublish = () => {
        const newState = !isPublished;
        setIsPublished(newState);
        console.log(`Chapter ${chapterId} is now ${newState ? 'published' : 'unpublished'}`);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Deployment</h3>
            </div>
            
            <div className="text-left text-gray-500 py-8 flex items-center">
                <label htmlFor="publicVisibility" className="mr-2">Publish Chapter</label>
                <div onClick={handlePublish} className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                    <input 
                        type="checkbox"
                        id="publicVisibility"
                        className="absolute w-0 h-0 opacity-0"
                        checked={isPublished}
                        readOnly
                    />
                    <div className={`block w-12 h-6 rounded-full ${isPublished ? 'bg-socratic' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${isPublished ? 'transform translate-x-6' : ''}`}></div>
                </div>
            </div>

            <div className="mt-4">
                {isLoading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : error ? (
                    <p className="text-sm text-red-500">{error}</p>
                ) : (
                    <div className="text-sm text-gray-600">
                        <p>Public ID: {publicId}</p>
                        <button 
                            onClick={handleRegenerateId}
                            className="text-socratic hover:text-socratic-dark text-sm ml-2"
                        >
                            Generate New ID
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Deployment;
