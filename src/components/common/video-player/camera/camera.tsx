import { Rnd } from "react-rnd";
import Webcam from "react-webcam";

export function Camera({ state }: any) {
  const minWidth = 400;
  const minHeight = 400;
  if (!state.isFullscreen) {
    return <></>;
  }
  return (
    <div
      onClickCapture={(e) => e.stopPropagation()}
      className={`absolute top-16 right-[${minWidth}px] min-w-[${minWidth}px]  ${
        state.cameraShown ? "z-50 opacity-100" : "-z-50 opacity-0"
      }`}
    >
      <Rnd
        minHeight={minHeight}
        minWidth={minWidth}
        className="rounded-lg"
        bounds="#video-container"
      >
        <Webcam className="h-full rounded-lg" />
      </Rnd>
    </div>
  );
}
