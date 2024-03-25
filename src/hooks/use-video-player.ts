import {
  DEFAULT_VIDEO_QUALITY,
  VIDEO_QUALITIES,
  VideoControlPopover,
} from "../consts/video-player";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useDebounce, useFullscreen, useToggle } from "react-use";

export function useVideoPlayer(
  videoContainerRef: React.RefObject<HTMLDivElement>,
  videoRef: React.RefObject<ReactPlayer>,
) {
  const [videoPlayer, setVideoPlayer] = useState(
    videoRef.current?.getInternalPlayer() as HTMLVideoElement,
  );

  const [volumeBeforeMute, setVolumeBeforeMute] = useState<number>();
  const [playIconPinged, setPingPlayIcon] = useState(false);
  const [pauseIconPinged, setPingPauseIcon] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [debouncedBuffering, setDebouncedBuffering] = useState(false);
  const [quality, setQuality] = useState(DEFAULT_VIDEO_QUALITY);
  const [sideBarShown, toggleSideBar] = useToggle(false);
  const [videoMirrored, toggleMirrorVideo] = useToggle(false);
  const [popoverShown, setPopoverShown] = useState<VideoControlPopover | null>(
    null,
  );
  const [cameraShown, toggleCamera] = useToggle(false);
  const [showFullscreen, toggleFullscreen] = useToggle(false);
  const isFullscreen = useFullscreen(videoContainerRef, showFullscreen, {
    onClose: () => toggleFullscreen(false),
  });

  const [videoState, setVideoState] = useState({
    playing: false,
    time: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
  });

  useDebounce(() => setDebouncedBuffering(buffering), 500, [buffering]);

  useEffect(() => {
    const MAX_RETRY = 8;
    let interval: NodeJS.Timeout;
    let retryCount = 0;
    if (videoRef.current) {
      interval = setInterval(() => {
        // We have to do this because the player is not available immediately.
        const player =
          videoRef.current?.getInternalPlayer() as HTMLVideoElement;
        if (player) {
          setVideoPlayer(player);
          clearInterval(interval);
        }
        if (retryCount > MAX_RETRY) {
          console.error("Failed to get video player");
          clearInterval(interval);
        }
        retryCount++;
      }, 1000);
    }
  }, [videoRef]);

  useEffect(() => {
    if (videoPlayer) {
      videoPlayer.onwaiting = () => {
        setBuffering(true);
      };
      videoPlayer.onplaying = () => {
        setBuffering(false);
      };
      videoPlayer.ontimeupdate = (e) => {
        setVideoState((prev) => ({ ...prev, time: videoPlayer.currentTime }));
      };
      videoPlayer.onload = () => {
        videoPlayer.play();
        videoPlayer.pause();
      };
    }
  }, [videoPlayer]);

  const toggleMute = (e: any) => {
    if (!videoPlayer) {
      return;
    }
    if (!videoPlayer.muted) {
      setVolumeBeforeMute(videoPlayer.volume);
      videoPlayer.muted = true;
    } else {
      videoPlayer.volume = volumeBeforeMute || 0;
      videoPlayer.muted = false;
    }
    setVideoState((prev) => ({ ...prev, muted: videoPlayer.muted }));
  };

  const togglePlay = () => {
    if (!videoPlayer) {
      return;
    }
    if (videoPlayer.paused) {
      setPingPauseIcon(false);
      setPingPlayIcon(true);
      videoPlayer.play();
    } else {
      setPingPlayIcon(false);
      setPingPauseIcon(true);
      videoPlayer.pause();
    }
    setVideoState((prev) => ({ ...prev, playing: !videoPlayer.paused }));
  };

  return {
    controls: {
      seek: (time: number) => {
        if (videoPlayer) {
          videoPlayer.currentTime = time;
          setVideoState((prev) => ({ ...prev, time }));
        }
      },
      setVolume: (volume: number) => {
        if (videoPlayer) {
          videoPlayer.volume = volume;
          setVideoState((prev) => ({ ...prev, volume }));
        }
      },
      setQuality: (q: any) => {
        setQuality(
          VIDEO_QUALITIES.indexOf(q) === -1 ? DEFAULT_VIDEO_QUALITY : q,
        );
      },
      setPlaybackRate: (newPlaybackRate: number) => {
        if (videoPlayer) {
          videoPlayer.playbackRate = newPlaybackRate;
          setVideoState((prev) => ({ ...prev, playbackRate: newPlaybackRate }));
        }
      },
      setProgress: (progress: number) => {},
      toggleCamera,
      toggleFullscreen,
      toggleMirrorVideo: () => {
        if (videoPlayer) {
          videoPlayer.style.transform = videoMirrored
            ? "scaleX(1)"
            : "scaleX(-1)";
        }
        toggleMirrorVideo();
      },
      toggleMute,
      togglePlay,
      toggleSideBar,
      showPopover: (popover: VideoControlPopover) => setPopoverShown(popover),
      hidePopover: () => setPopoverShown(null),
    },
    state: {
      ...videoState,
      duration: videoPlayer?.duration || 0,
      quality,
      buffering: debouncedBuffering,
      cameraShown,
      isFullscreen,
      pauseIconPinged,
      playIconPinged,
      sideBarShown,
      videoMirrored,
      popoverShown,
    },
  };
}
