import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ALIAS_DEVICE_IDS,
  MICROPHONE_STORAGE_KEY,
  SYSTEM_DEFAULT_ALIAS_ID,
  SYSTEM_DEFAULT_DEVICE_ID,
} from '@/constants/microphone';

/**
 * Microphone selection shared by every voice surface (exam + STT Lab).
 *
 * Two jobs:
 *  1. Let people pick their microphone explicitly, and remember the choice.
 *  2. Follow hardware the way Meet does — plug in earphones mid-session and
 *     the new mic takes over, unplug them and we fall back to the system
 *     default. Every automatic change raises a notice with an undo, so the
 *     switch is never silent.
 */

export type MicrophonePermission = 'unknown' | 'prompt' | 'granted' | 'denied';

export interface MicrophoneChangeNotice {
  message: string;
  /** Selection to restore on undo; null when there is nothing to go back to. */
  undoDeviceId: string | null;
}

export interface UseMicrophoneDevicesOptions {
  /**
   * Ask for microphone access on mount so device labels are readable.
   *
   * The exam page leaves this off: it must not raise a permission dialog
   * before the student's eligibility is confirmed. Where permission was
   * granted on an earlier visit the labels are readable without prompting
   * either way, so this only affects first-time visitors.
   */
  probeOnMount?: boolean;
  /** Follow device plug-in / removal automatically. */
  autoSwitch?: boolean;
}

export interface UseMicrophoneDevicesResult {
  devices: MediaDeviceInfo[];
  selectedId: string;
  selectDevice: (deviceId: string) => void;
  permission: MicrophonePermission;
  /** Which microphone "system default" currently resolves to, when knowable. */
  systemDefaultLabel: string | null;
  /** True once at least one device label is readable. */
  hasDeviceLabels: boolean;
  notice: MicrophoneChangeNotice | null;
  undoNotice: () => void;
  dismissNotice: () => void;
  requestAccess: () => Promise<void>;
  refresh: () => Promise<void>;
}

const readStoredDeviceId = (): string => {
  try {
    return window.localStorage.getItem(MICROPHONE_STORAGE_KEY) ?? SYSTEM_DEFAULT_DEVICE_ID;
  } catch {
    return SYSTEM_DEFAULT_DEVICE_ID;
  }
};

const writeStoredDeviceId = (deviceId: string) => {
  try {
    if (deviceId) window.localStorage.setItem(MICROPHONE_STORAGE_KEY, deviceId);
    else window.localStorage.removeItem(MICROPHONE_STORAGE_KEY);
  } catch {
    // Private browsing / storage disabled — the selection just won't persist.
  }
};

export const describeMicrophone = (device: MediaDeviceInfo): string =>
  device.label || `Microphone ${device.deviceId.slice(0, 6)}`;

/**
 * Name the device hiding behind "system default".
 *
 * Chrome ships a "default" alias that tracks the OS choice; it shares a
 * groupId with the real entry, which is a sturdier link than its label
 * ("Default - MacBook Pro Microphone") since that prefix is localised.
 * Browsers without the alias (Firefox, Safari) simply get no name.
 */
const resolveSystemDefaultLabel = (
  alias: MediaDeviceInfo | undefined,
  inputs: MediaDeviceInfo[]
): string | null => {
  if (!alias) return null;

  const sibling = alias.groupId
    ? inputs.find(device => device.groupId === alias.groupId && device.label)
    : undefined;
  if (sibling) return sibling.label;

  // Fall back to the alias label minus its prefix. Split on " - " rather than
  // the bare dash so hyphenated names ("USB-C Mic") survive intact.
  const [, ...rest] = alias.label.split(' - ');
  return rest.join(' - ') || alias.label || null;
};

export const useMicrophoneDevices = ({
  probeOnMount = false,
  autoSwitch = true,
}: UseMicrophoneDevicesOptions = {}): UseMicrophoneDevicesResult => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [systemDefaultLabel, setSystemDefaultLabel] = useState<string | null>(null);
  const [permission, setPermission] = useState<MicrophonePermission>('unknown');
  const [selectedId, setSelectedId] = useState<string>(readStoredDeviceId);
  const [notice, setNotice] = useState<MicrophoneChangeNotice | null>(null);

  const selectedIdRef = useRef(selectedId);
  const autoSwitchRef = useRef(autoSwitch);
  /** ids from the previous enumeration — null until the first one lands. */
  const knownIdsRef = useRef<Set<string> | null>(null);
  /** Last known label per id, so a removed device can still be named. */
  const labelsRef = useRef<Map<string, string>>(new Map());

  autoSwitchRef.current = autoSwitch;

  const applySelection = useCallback((deviceId: string) => {
    selectedIdRef.current = deviceId;
    setSelectedId(deviceId);
    writeStoredDeviceId(deviceId);
  }, []);

  const selectDevice = useCallback(
    (deviceId: string) => {
      setNotice(null);
      applySelection(deviceId);
    },
    [applySelection]
  );

  const refresh = useCallback(async () => {
    const all = await navigator.mediaDevices.enumerateDevices();
    const inputs = all.filter(
      device =>
        device.kind === 'audioinput' && device.deviceId && !ALIAS_DEVICE_IDS.has(device.deviceId)
    );
    setDevices(inputs);
    setSystemDefaultLabel(
      resolveSystemDefaultLabel(
        all.find(
          device => device.kind === 'audioinput' && device.deviceId === SYSTEM_DEFAULT_ALIAS_ID
        ),
        inputs
      )
    );
    inputs.forEach(device => {
      if (device.label) labelsRef.current.set(device.deviceId, device.label);
    });

    const ids = new Set(inputs.map(device => device.deviceId));
    const known = knownIdsRef.current;
    knownIdsRef.current = ids;
    const current = selectedIdRef.current;

    // The first populated list is our baseline, not a change to react to. It
    // also arrives right after permission is granted, when every device looks
    // "new" — auto-switching there would fight the remembered choice.
    if (!known || known.size === 0) {
      // A device remembered from an earlier visit may be gone; fall back quietly.
      if (current && !ids.has(current)) applySelection(SYSTEM_DEFAULT_DEVICE_ID);
      return;
    }

    if (!autoSwitchRef.current) return;

    const arrived = inputs.find(device => !known.has(device.deviceId));
    if (arrived) {
      // Plugging a microphone in is the clearest statement of intent there is.
      applySelection(arrived.deviceId);
      setNotice({
        message: `Switched to ${describeMicrophone(arrived)}`,
        undoDeviceId: current,
      });
      return;
    }

    if (current && !ids.has(current)) {
      const goneLabel = labelsRef.current.get(current) ?? 'That microphone';
      applySelection(SYSTEM_DEFAULT_DEVICE_ID);
      setNotice({
        message: `${goneLabel} was disconnected — using the system default microphone.`,
        undoDeviceId: null,
      });
    }
  }, [applySelection]);

  const requestAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermission('granted');
    } catch {
      setPermission('denied');
    }
    await refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    let permissionStatus: PermissionStatus | null = null;
    const handleDeviceChange = () => void refresh();
    const handlePermissionChange = () => {
      if (permissionStatus && !cancelled) {
        setPermission(permissionStatus.state as MicrophonePermission);
        void refresh();
      }
    };

    (async () => {
      // Read the granted/denied state without prompting where the browser
      // supports it (Chromium). Elsewhere we stay on 'unknown' and let the
      // caller decide whether to ask.
      let state: MicrophonePermission = 'unknown';
      try {
        permissionStatus = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        state = permissionStatus.state as MicrophonePermission;
        permissionStatus.addEventListener('change', handlePermissionChange);
      } catch {
        permissionStatus = null;
      }
      if (cancelled) return;
      setPermission(state);

      if (probeOnMount && state !== 'granted' && state !== 'denied') {
        await requestAccess();
      } else {
        await refresh();
      }
    })();

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      cancelled = true;
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      permissionStatus?.removeEventListener('change', handlePermissionChange);
    };
  }, [probeOnMount, refresh, requestAccess]);

  const undoNotice = useCallback(() => {
    applySelection(notice?.undoDeviceId ?? SYSTEM_DEFAULT_DEVICE_ID);
    setNotice(null);
  }, [applySelection, notice]);

  const dismissNotice = useCallback(() => setNotice(null), []);

  // Stable while nothing has changed, so consumers can depend on the result
  // itself rather than picking it apart field by field.
  return useMemo(
    () => ({
      devices,
      selectedId,
      selectDevice,
      permission,
      systemDefaultLabel,
      hasDeviceLabels: devices.some(device => Boolean(device.label)),
      notice,
      undoNotice,
      dismissNotice,
      requestAccess,
      refresh,
    }),
    [
      devices,
      dismissNotice,
      notice,
      permission,
      refresh,
      requestAccess,
      selectDevice,
      selectedId,
      systemDefaultLabel,
      undoNotice,
    ]
  );
};
