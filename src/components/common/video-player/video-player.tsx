import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/20/solid";
import { useRef } from "react";
import { Camera } from "./camera/camera";
import { ControlBar } from "./controlbar/controlbar";
import { PlaybackRatePopover } from "./playback-rate-popover/playback-rate-popover";
import { SettingsPopover } from "./settings-popover/settings-popover";
import { SideBar } from "./sidebar/sidebar";
import { VideoQualityPopover } from "./video-quality-popover/video-quality-popover";
import { useVideoPlayer } from "@/src/hooks/use-video-player";
import ReactPlayer from "react-player";

// @todo - Fix slow/sluggish seeking behavior on high quality videos. Solution: (Needs to be mp4 encoded)
export default function VideoPlayer({
  urls,
  disableSettings,
  sections,
  className,
}: {
  localPath?: string;
  disableSettings?: boolean;
  urls: { [quality: string]: string };
  sections: any;
  className?: string;
}) {
  const videoContainerRef = useRef(null);
  const videoRef = useRef<ReactPlayer>(null);
  const { state, controls } = useVideoPlayer(videoContainerRef, videoRef);
  console.log("video state", state, videoRef);

  const onVideoContainerClick = () => {
    controls.togglePlay();
    controls.hidePopover();
  };

  const renderPingedIcons = () => {
    const className = "w-16 animate-ping text-black duration-1000";
    if (state.playIconPinged) {
      return (
        <PlayCircleIcon
          className={className}
          style={{ animationIterationCount: 1, animationFillMode: "forwards" }}
        />
      );
    }
    if (state.pauseIconPinged) {
      return (
        <PauseCircleIcon
          className={className}
          style={{ animationIterationCount: 1, animationFillMode: "forwards" }}
        />
      );
    }
    return <></>;
  };

  const renderBuffering = () => {
    if (!state.buffering) {
      return <></>;
    }
    return <>Loading...</>;
  };

  return (
    <div
      id="video-container "
      ref={videoContainerRef}
      className={`relative flex flex-col items-center border-2 border-red-500 bg-black`}
      onClick={onVideoContainerClick}
    >
      <div className="flex-grow">
        <ReactPlayer
          url={
            // "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            urls["auto"]
          }
          controls={false}
          ref={videoRef}
          width={"auto"}
          height={"100%"}
        />
      </div>
      <div className="absolute bottom-0 w-full">
        <ControlBar
          disableSettings={disableSettings}
          controls={controls}
          state={state}
        />
      </div>
      <Camera state={state} />
      <div className="absolute left-[50%] top-[50%] translate-x-[-50%]  translate-y-[-50%] ">
        {renderPingedIcons()}
      </div>
      {/* {renderPingedIcons()} */}
      {/* {renderBuffering()} */}

      {!disableSettings ? (
        <div id="settings">
          <SideBar controls={controls} state={state} sections={sections} />
          <SettingsPopover controls={controls} state={state} />
          <PlaybackRatePopover controls={controls} state={state} />
          <VideoQualityPopover controls={controls} state={state} />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
