import { SYSTEM_DEFAULT_DEVICE_ID, SYSTEM_DEFAULT_OPTION } from '@/constants/microphone';
import { Mic, Undo2, X } from 'lucide-react';

import { UseMicrophoneDevicesResult, describeMicrophone } from '@/hooks/useMicrophoneDevices';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MicrophoneSelectProps {
  mic: UseMicrophoneDevicesResult;
  /** Lock the picker (e.g. while a session is still connecting). */
  disabled?: boolean;
  /** Explains what changing the mic does on this surface. */
  hint?: string;
  className?: string;
  labelClassName?: string;
}

export function MicrophoneSelect({
  mic,
  disabled = false,
  hint,
  className,
  labelClassName,
}: MicrophoneSelectProps) {
  const { devices, selectedId, selectDevice, permission, hasDeviceLabels, notice } = mic;
  const { systemDefaultLabel } = mic;
  // Until access is granted the browser reports neither names nor ids, so the
  // list is empty and the only useful thing to offer is the permission prompt.
  const needsAccess = permission !== 'granted' && !hasDeviceLabels;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor="microphone-select"
        className={cn(
          'text-foreground flex items-center gap-1.5 text-sm font-medium',
          labelClassName
        )}
      >
        <Mic className="text-muted-foreground h-3.5 w-3.5" />
        Microphone
      </label>

      <Select
        value={selectedId || SYSTEM_DEFAULT_OPTION}
        onValueChange={value =>
          selectDevice(value === SYSTEM_DEFAULT_OPTION ? SYSTEM_DEFAULT_DEVICE_ID : value)
        }
        disabled={disabled || permission === 'denied'}
      >
        <SelectTrigger id="microphone-select" className="w-full">
          <SelectValue placeholder="System default" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SYSTEM_DEFAULT_OPTION}>
            System default
            {systemDefaultLabel && (
              <span className="text-muted-foreground">— {systemDefaultLabel}</span>
            )}
          </SelectItem>
          {devices.map(device => (
            <SelectItem key={device.deviceId} value={device.deviceId}>
              {describeMicrophone(device)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {notice && (
        <div className="border-chart-2/30 bg-chart-2/10 animate-in fade-in slide-in-from-top-1 flex items-start gap-2 rounded-md border px-3 py-2 text-xs duration-200">
          <span className="text-foreground flex-1">{notice.message}</span>
          {notice.undoDeviceId !== null && (
            <button
              type="button"
              onClick={mic.undoNotice}
              className="text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1 font-medium underline-offset-2 hover:underline"
            >
              <Undo2 className="h-3 w-3" />
              Undo
            </button>
          )}
          <button
            type="button"
            onClick={mic.dismissNotice}
            aria-label="Dismiss microphone notice"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {permission === 'denied' ? (
        <p className="text-destructive text-xs">
          Microphone access is blocked — allow it in your browser settings and reload.
        </p>
      ) : needsAccess ? (
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-xs">
            Device names are hidden until you allow mic access.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => void mic.requestAccess()}
          >
            Show names
          </Button>
        </div>
      ) : (
        hint && <p className="text-muted-foreground text-xs">{hint}</p>
      )}
    </div>
  );
}

export default MicrophoneSelect;
