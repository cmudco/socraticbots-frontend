import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';

import {
  useIsPublicProgressStreaming,
  usePublicProgressTokens,
} from '@/stores/core/publicWebSocketStore';

import { Badge } from '@/components/ui/badge';

const PublicTrackingSidebar: React.FC = () => {
  const [isProgressCollapsed, setProgressCollapsed] = useState(false);

  // Use individual WebSocket selectors to avoid re-render loops
  const isProgressStreaming = useIsPublicProgressStreaming();
  const progressTokens = usePublicProgressTokens();

  return (
    <div className="from-muted/30 via-background to-primary/5 flex h-full flex-col bg-gradient-to-br">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {/* Progress Assessment Section */}
        <div className="border-border bg-background/90 rounded-2xl border shadow-sm backdrop-blur-sm">
          <div className="border-border/60 border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="from-secondary to-secondary/80 flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br">
                  <TrendingUp className="text-secondary-foreground h-3 w-3" />
                </div>
                <h3 className="text-foreground text-sm font-semibold">Progress Assessment</h3>
              </div>
              <div className="flex items-center space-x-2">
                {isProgressStreaming && (
                  <Badge
                    variant="secondary"
                    className="border-secondary/20 bg-secondary/10 text-secondary-foreground animate-pulse"
                  >
                    <div className="border-secondary mr-1 h-3 w-3 animate-spin rounded-full border border-t-transparent"></div>
                    Analyzing...
                  </Badge>
                )}
                <button
                  onClick={() => setProgressCollapsed(!isProgressCollapsed)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={isProgressCollapsed ? 'Expand' : 'Collapse'}
                >
                  {isProgressCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          {!isProgressCollapsed && (
            <div className="px-4 py-3">
              {!progressTokens.length && !isProgressStreaming ? (
                <div className="py-8 text-center">
                  <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <Lightbulb className="text-muted-foreground h-6 w-6" />
                  </div>
                  <h4 className="text-foreground mb-2 text-sm font-medium">No Progress Data Yet</h4>
                  <p className="text-muted-foreground mb-4 text-xs">
                    Start chatting to get personalized feedback on your learning progress
                  </p>
                  <Badge variant="outline" className="bg-muted">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    Begin Learning
                  </Badge>
                </div>
              ) : (
                <div className="space-y-4">
                  {(isProgressStreaming || progressTokens.length > 0) && (
                    <div className="space-y-4">
                      <div className="prose prose-sm prose-slate max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => (
                              <h1 className="border-secondary from-secondary/10 to-secondary/5 text-foreground mb-4 flex items-center rounded-lg border-l-4 bg-gradient-to-r p-3 text-base font-bold">
                                <TrendingUp className="text-secondary-foreground mr-2 h-4 w-4 flex-shrink-0" />
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-foreground mt-5 mb-3 flex items-center text-sm font-semibold">
                                <div className="bg-secondary mr-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-muted-foreground mt-4 mb-2 flex items-center text-sm font-medium">
                                <div className="bg-muted-foreground mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="bg-muted/30 mb-4 space-y-2 rounded-lg p-3">
                                {children}
                              </ul>
                            ),
                            li: ({ children }) => (
                              <li className="text-muted-foreground flex items-start space-x-2 text-sm">
                                <div className="bg-secondary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
                                <span>{children}</span>
                              </li>
                            ),
                            strong: ({ children }) => (
                              <strong className="bg-accent text-foreground rounded px-1 font-semibold">
                                {children}
                              </strong>
                            ),
                            blockquote: ({ children }) => (
                              <div className="border-secondary from-secondary/10 to-secondary/5 my-4 rounded-r-lg border-l-4 bg-gradient-to-r p-4">
                                <div className="text-foreground text-sm font-medium">
                                  {children}
                                </div>
                              </div>
                            ),
                          }}
                        >
                          {progressTokens.join('')}
                        </ReactMarkdown>
                      </div>

                      {isProgressStreaming && (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="bg-secondary h-2 w-2 animate-pulse rounded-full"></div>
                          <span className="text-secondary-foreground text-xs font-medium">
                            Generating assessment...
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {isProgressStreaming && progressTokens.length === 0 && (
                    <div className="space-y-4 py-6">
                      <div className="flex items-center justify-center">
                        <div className="border-secondary/20 border-t-secondary h-8 w-8 animate-spin rounded-full border-2"></div>
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="text-foreground text-sm font-medium">
                          Analyzing your progress...
                        </p>
                        <p className="text-muted-foreground text-xs">This may take a few moments</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {progressTokens.length > 0 && !isProgressStreaming && (
          <div className="border-border from-primary/5 to-secondary/5 rounded-2xl border bg-gradient-to-r shadow-sm">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="text-secondary-foreground h-4 w-4" />
                  <span className="text-foreground text-sm font-medium">Progress Active</span>
                </div>
                <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground">
                  Updated
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-border/60 bg-background/90 border-t px-4 py-3 backdrop-blur-sm">
        <div className="text-muted-foreground flex items-center justify-center space-x-2 text-xs">
          <div className="bg-secondary h-2 w-2 animate-pulse rounded-full"></div>
          <span>Progress updates automatically as you chat</span>
        </div>
      </div>
    </div>
  );
};

export default PublicTrackingSidebar;
