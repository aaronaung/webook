"use client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import PriceTag from "@/src/components/ui/price-tag";
import { useAsyncFileUpload } from "@/src/contexts/async-file-upload";
import { Tables } from "@/types/db";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  PauseIcon,
  PlayCircleIcon,
  PlayIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/solid";
import { useSupaMutation } from "@/src/hooks/use-supabase";
import { deleteClass } from "@/src/data/class";
import { toast } from "../ui/use-toast";
import { supaClientComponentClient } from "@/src/data/clients/browser";
import { BUCKETS } from "@/src/consts/storage";
import { SpeakerXMarkIcon } from "@heroicons/react/24/outline";
import { Spinner } from "./loading-spinner";
import { useBuyDanceClass } from "@/src/hooks/use-buy-dance-class";
import { useAuthUser } from "@/src/contexts/auth";
import Link from "next/link";
import { ClassActionType, DIFFICULTY_COLORS } from "@/src/consts/classes";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const PREVIEW_URL_FETCH_RETRY_COUNT = 5;
const PREVIEW_URL_FETCH_RETRY_BACKOFF = 1500;

export default function ClassCard({
  danceClass,
  classActionType = ClassActionType.Buy,
  classActionOverride,
  hidePriceTag = false,
}: {
  danceClass: Tables<"classes"> & { business: Tables<"businesses"> | null };
  classActionType?: ClassActionType;
  classActionOverride?: React.ReactNode;
  hidePriceTag?: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const { user } = useAuthUser();
  const asyncUploader = useAsyncFileUpload();
  const [uploadProgress, setUploadProgress] = useState(0);
  const { mutate: _deleteClass, isPending: deletingClass } = useSupaMutation(
    deleteClass,
    {
      invalidate: [["listClasses"]],
    },
  );

  const { buy } = useBuyDanceClass({
    business: danceClass.business,
    user,
  });

  useEffect(() => {
    fetchSignedPreviewUrl();
  }, [danceClass.id]);

  const fetchSignedPreviewUrl = async () => {
    let retries = 0;
    while (retries < PREVIEW_URL_FETCH_RETRY_COUNT) {
      try {
        const { data } = await supaClientComponentClient()
          .storage.from(BUCKETS.classes)
          .createSignedUrl(`${danceClass.id}/preview`, 24 * 3600);

        if (!data?.signedUrl) {
          retries++;
          await new Promise((resolve) =>
            setTimeout(resolve, PREVIEW_URL_FETCH_RETRY_BACKOFF),
          );
          continue;
        }
        setPreviewUrl(data?.signedUrl);
        return;
      } catch (e) {
        console.log("ERROR ", e);
        retries++;
        await new Promise((resolve) =>
          setTimeout(resolve, PREVIEW_URL_FETCH_RETRY_BACKOFF),
        );
      }
    }
  };

  const renderPingedIcons = () => {
    const className = "absolute w-10 animate-ping text-black duration-1000";
    if (!previewUrl) {
      return <></>;
    }
    if (previewPlaying) {
      return (
        <PlayCircleIcon
          className={className}
          style={{ animationIterationCount: 1, animationFillMode: "forwards" }}
        />
      );
    }
    return <></>;
  };

  const renderUploadStatus = () => {
    switch (asyncUploader.status(danceClass.id)) {
      case "uploading":
        return (
          <Button
            onClick={() => {
              asyncUploader.pause(danceClass.id);
            }}
            className="h-14 w-14 rounded-full"
          >
            <PauseIcon width={24} />
          </Button>
        );
      case "paused":
        return (
          <Button
            onClick={() => {
              asyncUploader.resume(danceClass.id);
            }}
            className="h-14 w-14 rounded-full"
          >
            <PlayIcon width={20} />
          </Button>
        );
      default:
        return <>{asyncUploader.status(danceClass.id)}</>;
    }
  };

  const renderFooterAction = () => {
    if (classActionOverride) {
      return classActionOverride;
    }
    switch (classActionType) {
      case ClassActionType.Buy:
        return (
          <Button
            className="ml-2 rounded-full bg-green-600 hover:bg-green-700"
            onClick={() => {
              buy(danceClass);
            }}
          >
            Buy
          </Button>
        );
      case ClassActionType.View:
        return (
          <Link href={`/app/student/classes/${danceClass.id}`}>
            <Button className="ml-2 rounded-full">View lesson</Button>
          </Link>
        );

      default:
        return <></>;
    }
  };

  useEffect(() => {
    asyncUploader.onSuccess(danceClass.id, () => {
      fetchSignedPreviewUrl();
    });
    asyncUploader.onProgress(danceClass.id, (progress) => {
      setUploadProgress(progress);
    });
    asyncUploader.onError(danceClass.id, (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to upload class videos.`,
      });
      _deleteClass(danceClass);
    });
  }, [asyncUploader, danceClass.id]);

  return (
    <Card key={danceClass.id} className="overflow-hidden">
      <CardContent className="p-0">
        {asyncUploader.inQueue(danceClass.id) ? (
          <div>
            <div className="flex h-64 w-full items-center justify-center gap-4">
              {renderUploadStatus()}
              <Button
                className="h-14 w-14 rounded-full"
                variant={"destructive"}
                disabled={deletingClass}
                onClick={() => {
                  const confirmed = confirm(
                    "Are you sure you want to cancel the upload? This will delete the class.",
                  );

                  if (confirmed) {
                    asyncUploader.cancel(danceClass.id);
                    _deleteClass(danceClass);
                  }
                }}
              >
                <XIcon width={24} />
              </Button>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <Progress className="rounded-none" value={uploadProgress} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{uploadProgress}% completed</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div
            className="relative flex h-64 items-center justify-center overflow-hidden"
            onClick={() => {
              setIsMuted(!isMuted);
            }}
          >
            {previewPlaying && (
              <div className="absolute right-4 top-4">
                {isMuted ? (
                  <Button
                    className="h-8 w-8 rounded-full p-0.5"
                    variant={"secondary"}
                  >
                    <SpeakerXMarkIcon
                      width={16}
                      className="text-secondary-foreground"
                    />
                  </Button>
                ) : (
                  <Button
                    className="h-8 w-8 rounded-full p-0.5"
                    variant={"secondary"}
                  >
                    <SpeakerWaveIcon
                      width={16}
                      className="text-secondary-foreground"
                    />
                  </Button>
                )}
              </div>
            )}
            {renderPingedIcons()}
            {!previewUrl ? (
              <div className="flex h-64 w-full items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <video
                src={previewUrl + "#t=0.001"}
                className="min-h-full min-w-full rounded-md object-cover"
                onMouseOver={(event: any) => {
                  setPreviewPlaying(true);
                  event.target?.play();
                }}
                onMouseOut={(event: any) => {
                  setPreviewPlaying(false);
                  setIsMuted(true);
                  event.target.currentTime = 0;
                  event.target?.pause();
                }}
                muted={isMuted}
              />
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="items-start p-3">
        <div className="flex min-w-0 flex-1 flex-col gap-y-1">
          <div className="flex items-center">
            <Badge
              className={`${
                DIFFICULTY_COLORS[danceClass.difficulty]
              } rounded-sm`}
            >
              {danceClass.difficulty}
            </Badge>

            {!hidePriceTag && (
              <PriceTag className="ml-2" price={danceClass.price} />
            )}
          </div>
          <p className="text-md line-clamp-2 font-medium text-secondary-foreground">
            {danceClass.title}
          </p>
          {danceClass.description && (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {danceClass.description}
            </p>
          )}

          {danceClass.business && (
            <Link href={`/${danceClass.business.handle}`}>
              🧠
              <span className="ml-2 cursor-pointer text-sm font-medium text-primary hover:underline">
                {danceClass.business.title}
              </span>
            </Link>
          )}
        </div>
        {renderFooterAction()}
      </CardFooter>
    </Card>
  );
}
