import { VideoControlPopover } from "@/src/consts/video-player";
import { fromSecToReadableTimestamp } from "@/src/libs/time";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  CogIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/20/solid";
import { useState } from "react";

function ProgressBar({ state, controls }: any) {
  return (
    <input
      id="default-range"
      className="relative h-1 w-full cursor-pointer align-top"
      type="range"
      // onMouseUp={(e: any) => controls.seek(e.target.value)}
      onChange={(e: any) => controls.seek(e.target.value)}
      value={state.time}
      min={0}
      max={state.duration}
    />
  );
}

function PlayPauseBtn({ state, controls }: any) {
  return (
    <div
      onClickCapture={controls.togglePlay}
      className={"play-pause w-5 flex-none cursor-pointer text-white sm:w-6"}
    >
      {state.playing ? <PauseIcon /> : <PlayIcon />}
    </div>
  );
}

function VolumeControl({ state, controls }: any) {
  const [currentVolume, setCurrentVolume] = useState(state.volume);
  const [isMuted, setIsMuted] = useState(state.muted);
  return (
    <div className="speaker group flex w-20 flex-none items-center text-white">
      <div
        onClickCapture={() => {
          controls.toggleMute();
          setIsMuted(!isMuted);
        }}
        className="mr-1 w-5 flex-none sm:w-6"
      >
        {isMuted || currentVolume === 0 ? (
          <SpeakerXMarkIcon className="cursor-pointer" />
        ) : (
          <SpeakerWaveIcon className="cursor-pointer" />
        )}
      </div>
      <input
        onChange={(e: any) => {
          if (isMuted && e.target.value > 0) {
            controls.toggleMute();
            setIsMuted(!isMuted);
          }
          controls.setVolume(e.target.value / 100);
          setCurrentVolume(e.target.value / 100);
        }}
        id="default-range"
        type="range"
        value={isMuted ? 0 : currentVolume * 100}
        min={0}
        max={100}
        className="h-2 w-full cursor-pointer rounded-lg"
      />
    </div>
  );
}

function VideoTimestamp({ state }: any) {
  return (
    <p className="w-24 flex-none text-sm text-white">
      {fromSecToReadableTimestamp(state.time)} /{" "}
      {fromSecToReadableTimestamp(state.duration)}
    </p>
  );
}

function SettingsBtn({ state, controls }: any) {
  const [popoverShown, setPopoverShown] = useState(false);
  return (
    <div
      onClickCapture={(e) => {
        if (state.popoverShown !== null) {
          controls.hidePopover();
        } else {
          controls.showPopover(VideoControlPopover.SettingsPopover);
        }
        e.stopPropagation();
      }}
      className="mr-2 w-5 flex-none text-white sm:w-6"
    >
      <CogIcon className="cursor-pointer" />
    </div>
  );
}

function FullscreenBtn({ state, controls }: any) {
  return (
    <div
      onClickCapture={controls.toggleFullscreen}
      className="w-5 flex-none text-white sm:w-6"
    >
      {state.isFullscreen ? (
        <ArrowsPointingInIcon className="cursor-pointer" />
      ) : (
        <ArrowsPointingOutIcon className="cursor-pointer" />
      )}
    </div>
  );
}

export function ControlBar({ state, controls, disableSettings }: any) {
  return (
    <div
      id="video-controls"
      onClick={(e) => {
        e.stopPropagation();
        controls.hidePopover();
      }}
      className="h-14 w-full bg-gradient-to-t from-black to-transparent"
    >
      <ProgressBar state={state} controls={controls} />
      <div className="relative bottom-4 z-10 flex w-full items-center space-x-4 px-4 py-2 sm:space-x-5">
        <PlayPauseBtn state={state} controls={controls} />
        <VolumeControl state={state} controls={controls} />
        <VideoTimestamp state={state} />
        <div className="flex-grow" />
        {!disableSettings ? (
          <SettingsBtn state={state} controls={controls} />
        ) : (
          <></>
        )}
        <FullscreenBtn state={state} controls={controls} />
      </div>
    </div>
  );
}
