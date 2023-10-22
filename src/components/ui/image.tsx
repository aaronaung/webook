import useImageWithRetry from "@/src/hooks/use-image-with-retry";
import { cn } from "@/src/utils";
import { ImgHTMLAttributes, useRef } from "react";

export default function Image(props: ImgHTMLAttributes<HTMLImageElement>) {
  const imgRef = useRef<HTMLImageElement>(null);
  const { hasError, isLoading, isRetrying } = useImageWithRetry(imgRef);

  return (
    <>
      {(isLoading || isRetrying) && (
        <div className={cn("bg-secondary", props.className)}></div>
      )}
      <img
        {...props}
        className={cn((isLoading || isRetrying) && "hidden", props.className)}
        ref={imgRef}
      />
    </>
  );
}
