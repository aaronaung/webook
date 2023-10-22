import { useEffect, useState, useRef, MutableRefObject } from "react";

const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 1500;

export const IMAGE_STATUS = {
  LOADING: "loading",
  RETRYING: "retrying",
  LOADED: "loaded",
  ERROR: "error",
};

const useImageWithRetry = (
  imageRef: MutableRefObject<HTMLImageElement | null>,
) => {
  const [imageStatus, setImageStatus] = useState(IMAGE_STATUS.LOADING);
  const retries = useRef(0);
  const srcVerificationRetries = useRef(0);

  const isRetrying = imageStatus === IMAGE_STATUS.RETRYING;
  const isLoaded = imageStatus === IMAGE_STATUS.LOADED;
  const isLoading =
    imageStatus === IMAGE_STATUS.LOADING ||
    imageStatus === IMAGE_STATUS.RETRYING;
  const hasError = imageStatus === IMAGE_STATUS.ERROR;

  useEffect(() => {
    if (!imageRef.current) {
      return;
    }

    const image = imageRef.current;
    let timerIds: NodeJS.Timeout[] = [];

    if (
      (image &&
        image.complete &&
        image.naturalWidth > 0 &&
        timerIds.length === 0) ||
      new URL(image.src).protocol === "blob:" // skip blob images
    ) {
      setImageStatus(IMAGE_STATUS.LOADED);
      return;
    }

    const handleError = (event: any) => {
      if (retries.current >= MAX_RETRIES) {
        setImageStatus(IMAGE_STATUS.ERROR);
        return;
      }

      setImageStatus(IMAGE_STATUS.RETRYING);

      retries.current = retries.current + 1;

      const timerId = setTimeout(() => {
        const img = event.target;
        const imgSrc = img.src;

        img.src = imgSrc;

        // Already removes itself from the list of timerIds
        timerIds.splice(timerIds.indexOf(timerId), 1);
      }, DEFAULT_TIMEOUT);
      timerIds.push(timerId);
    };

    const handleLoad = () => {
      setImageStatus(IMAGE_STATUS.LOADED);
      image.removeEventListener("complete", () => {});
      image.removeEventListener("error", handleError);
    };

    // Then we try to load the image with retry.
    image.addEventListener("error", handleError);
    image.addEventListener("load", handleLoad, { once: true });

    return () => {
      image.removeEventListener("complete", () => {});
      image.removeEventListener("error", handleError);
      image.removeEventListener("load", handleLoad);
      // Cleanup pending setTimeout's. We use `splice(0)` to clear the list.
      for (const timerId of timerIds.splice(0)) {
        clearTimeout(timerId);
      }
    };
  }, [imageRef, retries]);

  return {
    isLoaded,
    isLoading,
    isRetrying,
    hasError,
  };
};

export default useImageWithRetry;
