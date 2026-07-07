/**
 * Small animated voice-activity primitives shared by the voice exam UI.
 * Both are driven by currentColor so they stay theme-agnostic.
 */
import { cn } from '@/lib/utils';

const VOICE_BAR_HEIGHTS = ['45%', '75%', '100%', '65%', '40%'];

/** Five-bar equalizer driven by currentColor; animates only while active. */
export function VoiceActivityBars({
  active,
  fast = false,
  className,
}: {
  active: boolean;
  fast?: boolean;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={cn('flex h-4 w-5 items-center justify-between', className)}>
      {VOICE_BAR_HEIGHTS.map((height, index) => (
        <span
          key={index}
          className={cn(
            'w-[3px] rounded-full bg-current transition-transform duration-300',
            active ? 'animate-voice-bar' : 'scale-y-[30%]'
          )}
          style={{
            height,
            animationDelay: `${index * 110}ms`,
            animationDuration: fast ? '0.65s' : undefined,
          }}
        />
      ))}
    </span>
  );
}

export function ThinkingDots({
  className,
  dotClassName,
}: {
  className?: string;
  dotClassName?: string;
}) {
  return (
    <span aria-hidden="true" className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map(index => (
        <span
          key={index}
          className={cn('animate-thinking-dot h-1.5 w-1.5 rounded-full bg-current', dotClassName)}
          style={{ animationDelay: `${index * 150}ms` }}
        />
      ))}
    </span>
  );
}
