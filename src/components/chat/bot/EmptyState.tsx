import React from 'react';

import { MessageSquare } from 'lucide-react';

import { useConversationStore } from '@/stores/core/conversationStore';

const EmptyState: React.FC = () => {
  const { currentBot } = useConversationStore();

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-12 text-center">
      <div className="from-primary to-primary/80 mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br shadow-lg">
        <MessageSquare className="text-primary-foreground w-10" />
      </div>
      <h3 className="text-foreground mb-4 text-2xl font-semibold">Start a Conversation</h3>
      <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
        {currentBot?.prompts?.greeting}
      </p>
    </div>
  );
};

export default EmptyState;
