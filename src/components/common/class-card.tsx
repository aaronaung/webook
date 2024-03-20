"use client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import PriceTag from "@/src/components/ui/price-tag";
import { useAsyncFileUpload } from "@/src/contexts/async-file-upload";
import { Tables } from "@/types/db";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";

export default function ClassCard({
  danceClass,
  footerActionButton,
}: {
  danceClass: Tables<"classes">;
  footerActionButton?: React.ReactNode;
}) {
  const asyncUploader = useAsyncFileUpload();
  const [uploadProgress, setUploadProgress] = useState(0);

  const renderUploadActionButton = () => {
    switch (asyncUploader.status(danceClass.id)) {
      case "uploading":
        return (
          <Button
            onClick={() => {
              asyncUploader.pause(danceClass.id);
            }}
            className="h-16 w-16 rounded-full"
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
            className="h-16 w-16 rounded-full"
          >
            <PlayIcon width={24} />
          </Button>
        );
      default:
        return <>{asyncUploader.status(danceClass.id)}</>;
    }
  };

  useEffect(() => {
    asyncUploader.onProgress(danceClass.id, (progress) => {
      setUploadProgress(progress);
    });
  }, [asyncUploader, danceClass.id]);

  return (
    <Card key={danceClass.id}>
      <CardContent className="p-0">
        {asyncUploader.inQueue(danceClass.id) ? (
          <div>
            <div className="flex h-40 w-full items-center justify-center gap-4">
              {renderUploadActionButton()}
              <Button
                className="h-16 w-16 rounded-full"
                variant={"destructive"}
              >
                <XIcon width={24} />
              </Button>
            </div>
            <Progress value={uploadProgress} />
          </div>
        ) : (
          <img
            className="cover h-72 w-full rounded-t-md"
            src={`/offstage_1.jpeg`}
            alt=""
          />
        )}
      </CardContent>
      <CardFooter className="items-start p-3">
        <div className="flex min-w-0 flex-1 flex-col gap-y-1">
          <div className="flex">
            <p className="text-md line-clamp-1 font-medium text-secondary-foreground">
              {danceClass.title}
            </p>
            <PriceTag className="ml-2" price={danceClass.price} />
          </div>

          {danceClass.description && (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {danceClass.description}
            </p>
          )}
        </div>
        {footerActionButton}
      </CardFooter>
    </Card>
  );
}
