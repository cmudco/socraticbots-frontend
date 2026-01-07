import React, { useState } from 'react';

import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Cpu,
  FileText,
  MessageSquare,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';

import { useDebugInfo } from '@/stores/core/websocketStore';
import type { DebugMessage } from '@/stores/core/websocketStore';

import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface DebugPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * DebugPanel - Sheet that slides from right showing LLM debug info
 */
const DebugPanel: React.FC<DebugPanelProps> = ({ open, onOpenChange }) => {
  const debugInfo = useDebugInfo();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    model: true,
    context: false,
    messages: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[50vw] flex-col overflow-hidden sm:max-w-[50vw]">
        <SheetHeader className="border-border/60 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-lg">Debug Inspector</SheetTitle>
              <SheetDescription>
                {debugInfo ? `Request #${debugInfo.messageId}` : 'Waiting for request...'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          {!debugInfo ? (
            <EmptyState />
          ) : (
            <>
              {/* Model Info Card */}
              <CollapsibleSection
                title="Model"
                icon={<Cpu className="h-4 w-4 text-blue-500" />}
                expanded={expandedSections.model}
                onToggle={() => toggleSection('model')}
                badge={debugInfo.llmName}
              >
                <div className="space-y-3">
                  <InfoRow label="Model" value={debugInfo.llmName} highlight />
                  <InfoRow label="Identifier" value={debugInfo.llmIdentifier} mono />
                  <InfoRow
                    label="Web Search"
                    value={
                      <Badge variant={debugInfo.webSearchEnabled ? 'default' : 'secondary'}>
                        {debugInfo.webSearchEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    }
                  />
                  <div className="flex gap-2 pt-2">
                    {debugInfo.isSocraticMode && (
                      <Badge
                        variant="outline"
                        className="border-purple-500/30 bg-purple-500/10 text-purple-600"
                      >
                        <BookOpen className="mr-1 h-3 w-3" />
                        Socratic
                      </Badge>
                    )}
                    {debugInfo.isAdvancedMode && (
                      <Badge
                        variant="outline"
                        className="border-amber-500/30 bg-amber-500/10 text-amber-600"
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        Advanced
                      </Badge>
                    )}
                  </div>
                </div>
              </CollapsibleSection>

              {/* Vector Context Card */}
              <CollapsibleSection
                title="Vector Search"
                icon={<Search className="h-4 w-4 text-emerald-500" />}
                expanded={expandedSections.context}
                onToggle={() => toggleSection('context')}
                badge={`User ${debugInfo.vectorUserId ?? 'N/A'}`}
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard label="User ID" value={debugInfo.userId ?? 'N/A'} />
                    <StatCard label="Owner ID" value={debugInfo.fileOwnerId ?? 'N/A'} />
                    <StatCard label="Vector ID" value={debugInfo.vectorUserId ?? 'N/A'} highlight />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Max Snippets" value={debugInfo.maxContextSnippets} />
                    <StatCard
                      label="Threshold"
                      value={debugInfo.similarityThreshold?.toFixed(2) ?? 'N/A'}
                    />
                  </div>

                  {debugInfo.embeddingFileNames?.length > 0 && (
                    <div className="border-border/50 border-t pt-2">
                      <p className="text-muted-foreground mb-2 text-xs">Source Files</p>
                      <div className="space-y-1">
                        {debugInfo.embeddingFileNames.map((name, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <FileText className="text-muted-foreground h-3 w-3 flex-shrink-0" />
                            <span className="text-foreground truncate">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>

              {/* Messages Card - Full LLM messages */}
              <CollapsibleSection
                title="LLM Messages"
                icon={<MessageSquare className="h-4 w-4 text-pink-500" />}
                expanded={expandedSections.messages}
                onToggle={() => toggleSection('messages')}
                badge={`${debugInfo.messages?.length || 0} msgs`}
              >
                <div className="space-y-3">
                  {debugInfo.messages?.map((msg, i) => (
                    <MessageCard key={i} message={msg} formatNumber={formatNumber} />
                  ))}
                </div>
              </CollapsibleSection>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

const EmptyState: React.FC = () => (
  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
    <div className="from-muted to-muted/60 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br">
      <MessageSquare className="text-muted-foreground h-8 w-8" />
    </div>
    <h3 className="text-foreground mb-2 text-base font-semibold">No Debug Data</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">
      Send a message to see the full LLM request including system prompt, context, and user message.
    </p>
  </div>
);

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  expanded,
  onToggle,
  badge,
  children,
}) => (
  <div className="border-border/60 bg-card/50 overflow-hidden rounded-xl border">
    <button
      onClick={onToggle}
      className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3 transition-colors"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-foreground text-sm font-medium">{title}</span>
        {badge && (
          <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px]">
            {badge}
          </Badge>
        )}
      </div>
      {expanded ? (
        <ChevronDown className="text-muted-foreground h-4 w-4" />
      ) : (
        <ChevronRight className="text-muted-foreground h-4 w-4" />
      )}
    </button>
    {expanded && (
      <div className="border-border/40 border-t px-4 pb-4">
        <div className="pt-3">{children}</div>
      </div>
    )}
  </div>
);

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  highlight?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, mono, highlight }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground text-xs">{label}</span>
    <span
      className={`text-xs ${mono ? 'font-mono' : ''} ${highlight ? 'text-foreground font-medium' : 'text-foreground/80'}`}
    >
      {value}
    </span>
  </div>
);

interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, highlight }) => (
  <div
    className={`rounded-lg p-2 text-center ${highlight ? 'border border-emerald-500/20 bg-emerald-500/10' : 'bg-muted/50'}`}
  >
    <p className="text-muted-foreground mb-0.5 text-[10px]">{label}</p>
    <p
      className={`font-mono text-sm font-medium ${highlight ? 'text-emerald-600' : 'text-foreground'}`}
    >
      {value}
    </p>
  </div>
);

interface MessageCardProps {
  message: DebugMessage;
  formatNumber: (num: number) => string;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, formatNumber }) => {
  const roleColors: Record<string, string> = {
    system: 'bg-red-500/10 text-red-600 border-red-500/30',
    user: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    assistant: 'bg-green-500/10 text-green-600 border-green-500/30',
  };

  return (
    <div className="border-border/40 overflow-hidden rounded-lg border">
      <div className="bg-muted/30 border-border/40 flex items-center justify-between border-b px-3 py-2">
        <Badge variant="outline" className={`text-[10px] ${roleColors[message.role] || ''}`}>
          {message.role}
        </Badge>
        <span className="text-muted-foreground text-[10px]">
          {formatNumber(message.fullLength)} chars
        </span>
      </div>
      <div className="max-h-[400px] overflow-y-auto p-3">
        <pre className="text-foreground/90 font-mono text-[11px] leading-relaxed break-words whitespace-pre-wrap">
          {message.content}
        </pre>
      </div>
    </div>
  );
};

export default DebugPanel;
