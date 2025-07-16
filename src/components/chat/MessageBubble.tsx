import React, { useState } from 'react';

import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { Check, Copy } from 'lucide-react';

import { copyToClipboard } from '@/utils/clipboard';

import { renderMessageContent } from '@/components/chat/messageRenderer';
import { Button } from '@/components/ui/button';

import type { ChatMessage } from '@/types/chat';
import { ChatSender } from '@/types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isGreeting?: boolean;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGreeting = false,
  isStreaming = false,
}) => {
  const isAssistant = message.sender === 'assistant';
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isAssistant) {
    return (
      <div className="group mb-3">
        <div className="flex items-start">
          <div className="mr-3 flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-sm font-medium text-white shadow-md">
              AI
            </div>
          </div>

          {/* AI Message Content - constrained to create symmetry with user messages */}
          <div className="flex max-w-2xl flex-col items-start">
            <div className="relative w-full rounded-2xl rounded-tl-md border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm">
              {/* Render content using our helper function */}
              {renderMessageContent({
                content: message.content,
                sender: message.sender || ChatSender.USER,
                isGreeting,
                isStreaming,
              })}

              <div className="mt-2 flex justify-start text-xs">
                <span className="font-medium text-gray-500">
                  {isGreeting
                    ? 'Greeting'
                    : (() => {
                        if (message.timestamp) {
                          const date =
                            typeof message.timestamp === 'string'
                              ? parseISO(message.timestamp)
                              : new Date(message.timestamp);
                          if (isValid(date)) {
                            return formatDistanceToNow(date, { addSuffix: true });
                          }
                        }
                        return '';
                      })()}
                </span>
              </div>
            </div>

            {!isStreaming && (
              <div className="mt-1 flex justify-start opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 px-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  {isCopied ? (
                    <>
                      <Check size={12} className="mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <div className="flex items-start justify-end">
        <div className="flex flex-col items-end">
          <div className="relative max-w-sm rounded-2xl rounded-tr-md border border-purple-600 bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 text-white shadow-sm">
            {/* Render content using our helper function */}
            {renderMessageContent({
              content: message.content,
              sender: message.sender || ChatSender.USER,
              isGreeting,
              isStreaming,
            })}

            <div className="mt-1 flex justify-end text-xs">
              <span className="font-medium text-purple-200">
                {isGreeting
                  ? 'Greeting'
                  : (() => {
                      if (message.timestamp) {
                        const date =
                          typeof message.timestamp === 'string'
                            ? parseISO(message.timestamp)
                            : new Date(message.timestamp);
                        if (isValid(date)) {
                          return formatDistanceToNow(date, { addSuffix: true });
                        }
                      }
                      return '';
                    })()}
              </span>
            </div>
          </div>
        </div>

        <div className="ml-3 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-600 text-sm font-medium text-white shadow-md">
            You
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
