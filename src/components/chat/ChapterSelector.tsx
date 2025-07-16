import React from 'react';

import { useChapterToBookMapping, useChatChapters } from '@/hooks/queries/useChat';

import { useChatStore } from '@/stores/core/chatStore';

import { Chapter, chatService } from '@/services/chat.service';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ChapterSelector: React.FC = () => {
  const { data: chapters, isLoading } = useChatChapters();
  const { data: chapterToBookMapping } = useChapterToBookMapping();
  const { selectedChapterId, setChapterContext, setSelectedChapterId, clearChatState } =
    useChatStore();

  const handleChapterChange = async (chapterId: string) => {
    clearChatState();

    try {
      const bookId = chapterToBookMapping?.[chapterId];

      if (bookId) {
        try {
          const conversation = await chatService.getConversationForChapter(chapterId);
          setChapterContext(bookId, chapterId, conversation.id);
          return;
        } catch (error) {
          console.warn('Could not fetch conversation for chapter:', error);
        }

        setChapterContext(bookId, chapterId, '');
      } else {
        console.warn('Could not find book for chapter in mapping:', chapterId);
        setSelectedChapterId(chapterId);
      }
    } catch (error) {
      console.error('Error in handleChapterChange:', error);
      setSelectedChapterId(chapterId);
    }
  };

  if (isLoading) {
    return (
      <div className="w-64">
        <div className="h-10 animate-pulse rounded-md bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="w-64">
      <Select value={selectedChapterId || ''} onValueChange={handleChapterChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a chapter..." />
        </SelectTrigger>
        <SelectContent>
          {chapters?.map((chapter: Chapter) => (
            <SelectItem key={chapter.id} value={chapter.id}>
              <div className="flex flex-col">
                <span className="font-medium">{chapter.title}</span>
                {chapter.subject && (
                  <span className="text-xs text-gray-500">{chapter.subject}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChapterSelector;
