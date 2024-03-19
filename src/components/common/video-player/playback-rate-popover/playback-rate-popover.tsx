import { PLAYBACK_RATES, VideoControlPopover } from "@/src/consts/video-player";

export function PlaybackRatePopover({ controls, state }: any) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`${
        state.popoverShown === VideoControlPopover.PlaybackRatePopover
          ? "scale-y-100"
          : "scale-y-0"
      } absolute bottom-16 right-10 z-50 flex h-64 w-48 origin-bottom  flex-col rounded-lg bg-[rgba(0,0,0,0.75)] py-3 text-white transition`}
    >
      {PLAYBACK_RATES.map((rate) => (
        <div
          key={rate}
          onClick={() => {
            controls.setPlaybackRate(rate);
            controls.showPopover(VideoControlPopover.SettingsPopover);
          }}
          className="flex h-full cursor-pointer items-center px-2 text-xs hover:bg-gray-500"
        >
          <span>{rate == 1 ? "Normal" : rate}</span>
        </div>
      ))}
    </div>
  );
}
