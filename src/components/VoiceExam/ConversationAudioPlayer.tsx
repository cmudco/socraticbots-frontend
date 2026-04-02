import { useEffect, useRef, useState } from 'react';

import { Headphones, Pause, Play, RotateCcw, RotateCw } from 'lucide-react';

import { formatTimeInCall } from '@/utils/formatters';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConversationAudioPlayerProps {
  blobUrl: string | null;
  isLoading: boolean;
}

const ConversationAudioPlayer: React.FC<ConversationAudioPlayerProps> = ({
  blobUrl,
  isLoading,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [blobUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const timeLabel = `${formatTimeInCall(currentTime)} / ${isFinite(duration) && duration > 0 ? formatTimeInCall(duration) : '0:00'}`;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Headphones className="text-primary h-4 w-4" />
          Recording
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-5">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="bg-muted h-9 w-9 animate-pulse rounded-full" />
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="bg-muted h-1.5 w-full animate-pulse rounded-full" />
              <div className="bg-muted h-3 w-24 animate-pulse rounded" />
            </div>
          </div>
        ) : blobUrl ? (
          <div className="flex items-center gap-3">
            {/* Skip back 15s */}
            <button
              onClick={() => skip(-15)}
              className="text-muted-foreground hover:text-foreground relative flex h-8 w-8 shrink-0 items-center justify-center transition-colors"
              title="Rewind 15 seconds"
            >
              <RotateCcw className="h-[26px] w-[26px]" strokeWidth={1.75} />
              <span className="absolute inset-0 flex items-center justify-center text-[7px] leading-none font-bold">
                15
              </span>
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-all active:scale-95"
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
              )}
            </button>

            {/* Skip forward 15s */}
            <button
              onClick={() => skip(15)}
              className="text-muted-foreground hover:text-foreground relative flex h-8 w-8 shrink-0 items-center justify-center transition-colors"
              title="Forward 15 seconds"
            >
              <RotateCw className="h-[26px] w-[26px]" strokeWidth={1.75} />
              <span className="absolute inset-0 flex items-center justify-center text-[7px] leading-none font-bold">
                15
              </span>
            </button>

            {/* Progress track + time */}
            <div className="flex flex-1 flex-col gap-1.5">
              {/* Track */}
              <div className="group relative flex items-center">
                {/* Background track */}
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-none"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {/* Thumb */}
                <div
                  className="border-primary bg-background pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 shadow-sm transition-opacity"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
                {/* Invisible range input for interaction */}
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
              {/* Time */}
              <p className="text-muted-foreground text-xs tabular-nums">{timeLabel}</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Audio recording unavailable.</p>
        )}

        {blobUrl && (
          <audio
            ref={audioRef}
            src={blobUrl}
            onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
            onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationAudioPlayer;
