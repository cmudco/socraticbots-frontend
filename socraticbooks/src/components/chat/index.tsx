// src/components/chat/index.tsx
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import ChapterSelector from './ChapterSelector';
import ClassicInterface from './Classic/ClassicInterface';
import NewInterface from './New/NewInterface';
import { Chapter, getAvailableChapters } from '../../services/chatService';

type InterfaceType = 'classic' | 'new';
const LAST_SELECTED_CHAPTER_KEY = 'lastSelectedChapterId'; // Key for localStorage

const Chat: React.FC = () => {
    const user = useAuthContext();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [interfaceType, setInterfaceType] = useState<InterfaceType>('classic');

    // Load chapters and restore last selected chapter
    useEffect(() => {
        const fetchChapters = async () => {
            if (user?.uid) {
                try {
                    setIsLoading(true);
                    const availableChapters = await getAvailableChapters(user.uid);
                    setChapters(availableChapters);

                    // Get last selected chapter ID from localStorage
                    const lastSelectedChapterId = localStorage.getItem(LAST_SELECTED_CHAPTER_KEY);
                    if (lastSelectedChapterId) {
                        const lastChapter = availableChapters.find(c => c.id === lastSelectedChapterId);
                        if (lastChapter) {
                            setSelectedChapter(lastChapter);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching chapters:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchChapters();
    }, [user?.uid]);

    // Handle chapter selection and save to localStorage
    const handleChapterSelect = (chapter: Chapter) => {
        setSelectedChapter(chapter);
        try {
            localStorage.setItem(LAST_SELECTED_CHAPTER_KEY, chapter.id);
        } catch (error) {
            console.error('Error saving chapter selection to localStorage:', error);
        }
    };
    
    //Access Loss
    useEffect(() => {
        if (selectedChapter && !chapters.some(c => c.id === selectedChapter.id)) {
            // User no longer has access to the selected chapter
            setSelectedChapter(null);
            localStorage.removeItem(LAST_SELECTED_CHAPTER_KEY);
        }
    }, [chapters, selectedChapter]);

    return (
        <div className="h-[calc(100vh-3.5rem)] w-full"> {/* Changed to full width, adjusted height */}
            <div className="w-full">
                <ChapterSelector
                    chapters={chapters}
                    selectedChapterId={selectedChapter?.id}
                    onChapterSelect={handleChapterSelect}
                    isLoading={isLoading}
                    interfaceType={interfaceType}
                    onInterfaceToggle={setInterfaceType}
                />
            </div>
            
            <div className="h-[calc(100%-56px)]"> {/* Adjust based on your ChapterSelector height */}
                {selectedChapter ? (
                    interfaceType === 'classic' ? (
                        <ClassicInterface chapter={selectedChapter} />
                    ) : (
                        <NewInterface chapter={selectedChapter} />
                    )
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a chapter to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
