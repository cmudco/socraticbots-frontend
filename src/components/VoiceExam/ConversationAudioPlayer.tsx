import { Download, Headphones } from 'lucide-react';

import { useConversationAudio } from '@/hooks/queries/useVoiceConversations';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConversationAudioPlayerProps {
  conversationId: number;
  audioUrl: string;
}

const ConversationAudioPlayer: React.FC<ConversationAudioPlayerProps> = ({
  conversationId,
  audioUrl,
}) => {
  const { blobUrl, isLoading } = useConversationAudio(conversationId, audioUrl);

  const handleDownload = () => {
    if (!blobUrl) return;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `recording-${conversationId}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Headphones className="h-4 w-4" />
          Recording
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="bg-muted h-12 w-full animate-pulse rounded-md" />
        ) : blobUrl ? (
          <div className="flex flex-col gap-3">
            <audio controls src={blobUrl} className="w-full" preload="metadata" />
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Recording
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Audio recording unavailable.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationAudioPlayer;
