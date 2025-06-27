// src/components/chat/TrackingSidebar.tsx
import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useTrackingProgress } from '@/hooks/queries/useChat';
import ReactMarkdown from 'react-markdown';

const TrackingSidebar: React.FC = () => {
  const { selectedConversationId } = useChatStore();
  const { data, isLoading, error } = useTrackingProgress(selectedConversationId);

  const renderContent = () => {
    if (!selectedConversationId) {
      return <div className="p-4 text-gray-400">No chapter selected.</div>;
    }
    if (isLoading) {
      return <div className="p-4 text-gray-400">Loading tracking progress...</div>;
    }
    if (error) {
      return <div className="p-4 text-red-500">Error loading tracking progress.</div>;
    }
    if (!data || !data.content) {
      return <div className="p-4 text-gray-400">No tracking progress yet.</div>;
    }
    return (
      <div className="p-4">
        <div className="font-semibold mb-2">Tracking Progress</div>
        <ReactMarkdown>{data.content}</ReactMarkdown>
        {data.created_at && (
          <div className="text-xs text-gray-400 mt-2">Last updated: {new Date(data.created_at).toLocaleString()}</div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 border-r bg-gray-50">
      {renderContent()}
    </aside>
  );
};

export default TrackingSidebar;
