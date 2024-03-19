export const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const VIDEO_QUALITIES = ["auto", 1080, 720, 480];
export const DEFAULT_VIDEO_QUALITY = VIDEO_QUALITIES[0];

export enum VideoControlPopover {
  SettingsPopover,
  PlaybackRatePopover,
  VideoQualityPopover,
}
