"use client";

import { SaveClassDialog } from "@/src/components/dialogs/save-class-dialog";
import { SaveClassFormSchemaType } from "@/src/components/forms/save-class-form";
import ClassCard from "@/src/components/common/class-card";
import EmptyState from "@/src/components/common/empty-state";
import StripeBusinessAccountGuard from "@/src/components/common/stripe-business-account-guard";
import { Button } from "@/src/components/ui/button";
import { listClasses } from "@/src/data/class";
import { supaClientComponentClient } from "@/src/data/clients/browser";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Edit } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Uppy } from "@uppy/core";
import Tus from "@uppy/tus";
import { env } from "@/env.mjs";

type ClassDialogState = {
  isOpen: boolean;
  initFormValues?: Partial<SaveClassFormSchemaType>;
};

export default function Classes() {
  const { data, isLoading } = useSupaQuery(listClasses, undefined, {
    queryKey: ["listClasses"],
  });
  const [dialogState, setDialogState] = useState<ClassDialogState>({
    isOpen: false,
  });
  const uppy = useMemo(() => new Uppy(), []);

  useEffect(() => {
    uppy.on("upload-success", (file, response) => {
      console.log("successful upload", file, response);
    });
    uppy.on("upload-error", (file, error) => {
      console.log("failed upload", file, error);
    });
    uppy.on("progress", (progress) => {
      console.log("progress", progress);
    });
    uppy.on("cancel-all", () => {
      console.log("cancel-all");
    });
    uppy.on("pause-all", () => {
      console.log("pause-all");
    });
    uppy.on("resume-all", () => {
      console.log("resume-all");
    });
    return () => {
      uppy.close();
    };
  }, [uppy]);

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <StripeBusinessAccountGuard>
      <input
        id="fileUpload"
        type="file"
        onChange={(e) => {
          if (!e.target.files) return;
          const file = e.target.files[0];
          const addResult = uppy.addFile({
            data: file,
            size: file.size,
            name: file.name,
            meta: {
              bucketName: "class-videos",
              objectName: "test",
              contentType: "video/mov",
            },
          });
          console.log(addResult);
          console.log(e.target.files);
        }}
      />
      <Button
        onClick={async () => {
          const {
            data: { session },
          } = await supaClientComponentClient().auth.getSession();

          uppy.use(Tus, {
            endpoint: `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
            headers: {
              authorization: `Bearer ${session?.access_token}`,
              "x-upsert": "true",
            },
            uploadDataDuringCreation: true,
            removeFingerprintOnSuccess: true,
            chunkSize: 6 * 1024 * 1024,
            allowedMetaFields: [
              "bucketName",
              "objectName",
              "contentType",
              "cacheControl",
            ],
          });

          await uppy.upload();
        }}
      >
        Upload
      </Button>
      <Button
        onClick={async () => {
          uppy.pauseAll();
        }}
      >
        Pause
      </Button>
      <Button
        onClick={async () => {
          uppy.resumeAll();
        }}
      >
        Resume
      </Button>
      <Button
        onClick={async () => {
          uppy.cancelAll();
        }}
      >
        Cancel
      </Button>
      <SaveClassDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false })}
        initFormValues={dialogState.initFormValues}
      />
      {!data || data.length === 0 ? (
        <div>
          <EmptyState
            title="No classes"
            description="You don't have any classes yet. Create your first class to get started."
            actionButtonText="Create class"
            onAction={() => {
              setDialogState({ isOpen: true });
            }}
          />
        </div>
      ) : (
        <div className="relative mb-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {data.map((danceClass) => {
              return (
                <div className="" key={danceClass.id}>
                  <ClassCard
                    danceClass={danceClass}
                    footerActionButton={
                      <Button
                        className="p-3"
                        variant={"secondary"}
                        onClick={() => {
                          setDialogState({
                            isOpen: true,
                            initFormValues: danceClass,
                          });
                        }}
                      >
                        <Edit width={20} />
                      </Button>
                    }
                  />
                </div>
              );
            })}
          </div>

          <Button
            onClick={async () => {
              setDialogState({
                isOpen: true,
              });
            }}
            className="fixed bottom-6 right-8 h-16 w-16 rounded-full"
          >
            <PlusIcon width={28} />
          </Button>
        </div>
      )}
    </StripeBusinessAccountGuard>
  );
}
