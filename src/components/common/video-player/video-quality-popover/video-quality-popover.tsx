import {
  VIDEO_QUALITIES,
  VideoControlPopover,
} from "@/src/consts/video-player";

export function VideoQualityPopover({ controls, state }: any) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`${
        state.popoverShown === VideoControlPopover.VideoQualityPopover
          ? "scale-y-100"
          : "scale-y-0"
      } absolute bottom-16 right-10 z-50 flex h-48 w-48 origin-bottom  flex-col rounded-lg bg-[rgba(0,0,0,0.75)] py-3 text-white transition`}
    >
      {VIDEO_QUALITIES.map((quality) => (
        <div
          key={quality}
          onClick={() => {
            controls.setQuality(quality);
            controls.hidePopover();
          }}
          className="flex h-full cursor-pointer items-center px-2 text-xs hover:bg-gray-500"
        >
          <span>{quality == "auto" ? "Auto" : quality}</span>
        </div>
      ))}
    </div>
  );
}
