import React from 'react';

import { Download } from 'lucide-react';

import { useConversationStore } from '@/stores/core/conversationStore';

import { conversationService } from '@/services/conversation.service';

import { Button } from '@/components/ui/button';

const ExportButton: React.FC = () => {
  const { activeConversation } = useConversationStore();

  const handleExportConversation = async () => {
    if (!activeConversation?.dareConversationId) return;

    try {
      const { blob, filename } = await conversationService.exportConversationPdf(
        activeConversation.dareConversationId
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting conversation:', error);
    }
  };

  if (!activeConversation?.dareConversationId) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleExportConversation}
      className="hover:bg-accent flex items-center gap-2 px-3 py-2 text-sm"
      title="Export conversation as PDF"
    >
      <Download className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
      <span className="text-muted-foreground group-hover:text-foreground text-sm font-medium transition-colors">
        Export
      </span>
    </Button>
  );
};

export default ExportButton;
