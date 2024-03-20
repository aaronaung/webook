"use client";
import { env } from "@/env.mjs";
import Uppy from "@uppy/core";
import Tus, { TusOptions } from "@uppy/tus";
import { createContext, useContext, useEffect, useState } from "react";
import { supaClientComponentClient } from "../data/clients/browser";

type UploadOptions = TusOptions & {
  removeOnComplete?: boolean;
};
type AsyncFileUploadContextValue = {
  upload: (task: UploadTask, options?: UploadOptions) => Promise<void>;
  pause: (id: string) => void;
  resume: (id: string) => void;
  cancel: (id: string) => void;
  remove: (id: string) => void;
  onProgress: (id: string, onProgress?: (progress: number) => void) => void;
  onSuccess: (id: string, onSuccess?: () => void) => void;
  onError: (id: string, onError?: (error: any) => void) => void;
  inQueue: (id: string) => boolean;
  status: (id: string) => "uploading" | "paused" | "complete" | "canceled";
};

const AsyncFileUploadContext =
  createContext<AsyncFileUploadContextValue | null>(null);
function useAsyncFileUpload() {
  const context = useContext(AsyncFileUploadContext);
  if (!context) {
    throw new Error(
      `useAsyncFileUploadContext must be used within a AsyncFileUploadProvider`,
    );
  }
  return context;
}

const DEFAULT_TUS_UPLOAD_SETTINGS: TusOptions = {
  uploadDataDuringCreation: true,
  removeFingerprintOnSuccess: true,
  chunkSize: 2 * 1024 * 1024, // 2MB
  allowedMetaFields: [
    "bucketName",
    "objectName",
    "contentType",
    "cacheControl",
  ],
};

export type UploadTask = {
  id: string;
  targets: {
    file: File;
    bucketName: string;
    objectName: string;
    contentType: string;
  }[];
};

type UppyUploadTask = UploadTask & {
  uppyInstance: Uppy;
  status: "uploading" | "paused" | "complete" | "canceled";
  error?: any;
};

function AsyncFileUploadProvider({ ...props }) {
  const [uploadTasks, setUploadTasks] = useState<{
    [key: string]: UppyUploadTask;
  }>({});

  useEffect(() => {
    return () => {
      Object.values(uploadTasks).forEach((task) => {
        task.uppyInstance.close();
      });
    };
  }, []);

  /**
   * Stage puts a file into the upload queue, but does not start the upload.
   * Caller must call upload with the task ID to start the upload.
   */
  const stage = () => {};

  const setTaskStatus = (
    id: string,
    status: "uploading" | "paused" | "complete" | "canceled",
    err?: any,
  ) => {
    setUploadTasks((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status,
        error: err,
      },
    }));
  };

  const setOnProgressHandler = (
    id: string,
    onProgress?: (progress: number) => void,
  ) => {
    if (inQueue(id)) {
      uploadTasks[id].uppyInstance.on("progress", (progress) => {
        onProgress?.(progress);
      });
    }
  };

  const setOnSuccessHandler = (id: string, onSuccess?: () => void) => {
    if (inQueue(id)) {
      uploadTasks[id].uppyInstance.on("upload-success", () => {
        setTaskStatus(id, "complete");
        onSuccess?.();
      });
    }
  };

  const setOnError = (id: string, onError?: (error: any) => void) => {
    if (inQueue(id)) {
      uploadTasks[id].uppyInstance.on("upload-error", (file, err) => {
        setTaskStatus(id, "complete", err);
        onError?.(err);
      });
    }
  };

  /**
   * Remove removes a task from the upload queue and cancels the upload if it is in progress.
   */
  const remove = (id: string) => {
    const task = uploadTasks[id];
    if (task) {
      task.uppyInstance.close();
      setUploadTasks((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  /**
   * Upload starts the upload of a staged task.
   */
  const upload = async (task: UploadTask, options?: UploadOptions) => {
    const uppyInstance = new Uppy({
      id: task.id,
    });

    uppyInstance.addFiles(
      task.targets.map((t) => ({
        name: t.objectName,
        data: t.file,
        size: t.file.size,
        meta: {
          bucketName: t.bucketName,
          objectName: t.objectName,
          contentType: t.contentType,
        },
      })),
    );
    // Set default handlers
    uppyInstance.on("upload-success", () => {
      setTaskStatus(task.id, "complete");
    });
    uppyInstance.on("upload-error", (_, err) => {
      setTaskStatus(task.id, "complete", err);
    });
    uppyInstance.on("complete", () => {
      // Triggered when all files in the upload queue have completed with success or failure.
      uppyInstance.close();
      if (options?.removeOnComplete) {
        remove(task.id);
      }
    });

    const {
      data: { session },
    } = await supaClientComponentClient().auth.getSession();

    uppyInstance.use(Tus, {
      endpoint: `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
      headers: {
        authorization: `Bearer ${session?.access_token}`,
        "x-upsert": "true",
      },
      ...DEFAULT_TUS_UPLOAD_SETTINGS,
      ...options,
    });

    uppyInstance.upload();
    setUploadTasks((prev) => ({
      ...prev,
      [task.id]: {
        ...task,
        uppyInstance,
        status: "uploading" as const,
      },
    }));
  };

  const pause = (id: string) => {
    const task = uploadTasks[id];
    if (task) {
      task.uppyInstance.pauseAll();
      setTaskStatus(id, "paused");
    }
  };

  const resume = (id: string) => {
    const task = uploadTasks[id];
    if (task) {
      task.uppyInstance.resumeAll();
      setTaskStatus(id, "uploading");
    }
  };

  const cancel = (id: string) => {
    const task = uploadTasks[id];
    if (task) {
      task.uppyInstance.cancelAll();
      setTaskStatus(id, "canceled");
    }
  };

  const inQueue = (id: string) => !!uploadTasks[id];
  const status = (id: string) => uploadTasks[id]?.status;

  return (
    <AsyncFileUploadContext.Provider
      value={{
        remove,
        upload,
        pause,
        resume,
        cancel,
        onProgress: setOnProgressHandler,
        onSuccess: setOnSuccessHandler,
        onError: setOnError,
        inQueue,
        status,
      }}
      {...props}
    />
  );
}

export { AsyncFileUploadProvider, useAsyncFileUpload };
export default AsyncFileUploadContext;
