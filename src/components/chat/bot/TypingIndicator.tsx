import React from 'react';

import { Loader2 } from 'lucide-react';

const TypingIndicator: React.FC = () => (
  <div className="mb-6 flex justify-start">
    <div className="bg-background border-border mr-4 max-w-[80%] rounded-2xl border px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="from-secondary to-secondary/80 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br">
          <span className="text-secondary-foreground text-xs font-semibold">AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="text-primary h-4 w-4 animate-spin" />
          <span className="text-muted-foreground text-sm">Assistant is thinking...</span>
        </div>
      </div>
    </div>
  </div>
);

export default TypingIndicator;
