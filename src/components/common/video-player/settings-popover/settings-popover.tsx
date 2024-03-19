import { Switch } from "@/src/components/ui/switch";
import { VideoControlPopover } from "@/src/consts/video-player";
import {
  AdjustmentsHorizontalIcon,
  ArrowsRightLeftIcon,
  ChevronRightIcon,
  ForwardIcon,
  QueueListIcon,
  VideoCameraIcon,
} from "@heroicons/react/20/solid";

const settingContainerClass =
  "flex h-full cursor-pointer items-center px-3 text-xs hover:bg-gray-500";

function ShowSectionsSetting({ controls, state }: any) {
  return (
    <div onClick={controls.toggleSideBar} className={settingContainerClass}>
      <QueueListIcon className="mr-2 w-4" />
      <span>Show sections</span>
      <Switch
        className="ml-auto"
        onChange={controls.toggleSideBar}
        value={state.sideBarShown}
      ></Switch>
    </div>
  );
}

function MirrorVideoSetting({ controls, state }: any) {
  return (
    <div onClick={controls.toggleMirrorVideo} className={settingContainerClass}>
      <ArrowsRightLeftIcon className="mr-2 w-4" />
      <span>Mirror video</span>
      <Switch
        className="ml-auto"
        onChange={controls.toggleMirrorVideo}
        value={state.videoMirrored}
      ></Switch>
    </div>
  );
}

function CameraSetting({ controls, state }: any) {
  if (!state.isFullscreen) {
    return <></>;
  }
  return (
    <div onClick={controls.toggleCamera} className={settingContainerClass}>
      <VideoCameraIcon className="mr-2 w-4" />
      <span>Show camera</span>
      <Switch
        className="ml-auto"
        onChange={controls.toggleCamera}
        value={state.cameraShown}
      ></Switch>
    </div>
  );
}

function PlaybackRateSetting({ controls, state }: any) {
  return (
    <div
      onClick={() =>
        controls.showPopover(VideoControlPopover.PlaybackRatePopover)
      }
      className={settingContainerClass}
    >
      <ForwardIcon className="mr-2 w-4" />
      <span>Playback rate</span>
      <div className="ml-auto flex">
        <span className=" text-blue-400">
          {state.playbackRate == 1 ? "" : state.playbackRate}
        </span>
        <ChevronRightIcon className="ml-2 w-4" />
      </div>
    </div>
  );
}

function VideoQualitySetting({ controls }: any) {
  return (
    <div
      onClick={() =>
        controls.showPopover(VideoControlPopover.VideoQualityPopover)
      }
      className={settingContainerClass}
    >
      <AdjustmentsHorizontalIcon className="mr-2 w-4" />
      <span>Quality</span>
      <ChevronRightIcon className="ml-auto w-4" />
    </div>
  );
}

export function SettingsPopover({ controls, state }: any) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={`${
        state.popoverShown === VideoControlPopover.SettingsPopover
          ? "scale-y-100"
          : "scale-y-0"
      } absolute bottom-16 right-10 z-50 flex h-48 w-56 origin-bottom  flex-col rounded-lg bg-[rgba(0,0,0,0.75)] py-3 text-white transition`}
    >
      <ShowSectionsSetting controls={controls} state={state} />
      <MirrorVideoSetting controls={controls} state={state} />
      <CameraSetting controls={controls} state={state} />
      <PlaybackRateSetting controls={controls} state={state} />
      <VideoQualitySetting controls={controls} />
    </div>
  );
}
