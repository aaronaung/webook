import { ReactNode } from "react";
import { DropzoneOptions, FileRejection, useDropzone } from "react-dropzone";

export default function FileDropzone({
  onDrop,
  defaultIcon,
  options,
}: {
  onDrop: (files: File[], rejectedFiles: FileRejection[]) => void;
  defaultIcon?: ReactNode;
  options?: DropzoneOptions;
}) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      onDropAccepted: () => {
        console.log("hello onDropAccepted");
      },
      ...options,
    });

  return (
    <div
      {...getRootProps()}
      className="mt-2 flex cursor-pointer justify-center rounded-lg border border-dashed border-foreground/25 px-6 py-10"
    >
      <div className="text-center">
        {acceptedFiles.length > 0 ? (
          <img
            src={URL.createObjectURL(acceptedFiles[0])}
            alt="Cover photo"
            className="m-auto h-24 w-52 rounded-md"
          />
        ) : (
          defaultIcon
        )}
        <div className="text-md mt-4 flex leading-6 text-muted-foreground">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>{`Drag 'n' drop some files here, or click to select files`}</p>
          )}
        </div>
      </div>
    </div>
  );
}
