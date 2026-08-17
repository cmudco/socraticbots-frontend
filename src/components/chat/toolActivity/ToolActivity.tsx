/**
 * Tool-call activity panel for an assistant message — the SB counterpart of
 * DARE's ToolActivity. Renders one row per tool call, live-updating while
 * the tool loop streams and rehydrating from history `toolCalls`.
 */
import React from 'react';

import type { ChatToolCall } from '@/types/toolCalls';

import ToolActivityRow from './ToolActivityRow';

interface ToolActivityProps {
  toolCalls: ChatToolCall[];
}

export const ToolActivity: React.FC<ToolActivityProps> = ({ toolCalls }) => {
  if (!toolCalls.length) return null;

  return (
    <div className="bg-muted/50 mb-2 flex flex-col gap-1 rounded-lg p-1.5">
      {toolCalls.map(toolCall => (
        <ToolActivityRow key={toolCall.toolCallId} toolCall={toolCall} />
      ))}
    </div>
  );
};

export default ToolActivity;
