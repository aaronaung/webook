import { ReactNode } from "react";
import { useDropzone } from "react-dropzone";

export default function FileDropzone({
  onDrop,
  defaultIcon,
}: {
  onDrop: (files: File[]) => void;
  defaultIcon?: ReactNode;
}) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: { "image/*": [] },
      multiple: false,
      maxSize: 1000000,
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
        <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </div>
      </div>
    </div>
  );
}
