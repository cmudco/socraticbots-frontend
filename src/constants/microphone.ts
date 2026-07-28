/** '' means "system default" — no deviceId constraint is sent at all. */
export const SYSTEM_DEFAULT_DEVICE_ID = '';

/**
 * Radix Select rejects an empty item value, so "system default" travels
 * through the UI under this sentinel and is mapped back at the boundary.
 */
export const SYSTEM_DEFAULT_OPTION = 'system-default';

/**
 * Chrome exposes "default" and "communications" as aliases that duplicate a
 * real entry in the list. Hiding them keeps the picker honest: one row per
 * physical microphone, plus our own explicit "System default" option.
 */
export const ALIAS_DEVICE_IDS = new Set(['default', 'communications']);

/** The alias whose label names whichever device the OS currently defaults to. */
export const SYSTEM_DEFAULT_ALIAS_ID = 'default';

/** Remembers the chosen microphone across visits. */
export const MICROPHONE_STORAGE_KEY = 'voice.microphoneDeviceId';
