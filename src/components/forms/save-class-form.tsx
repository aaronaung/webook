import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import InputText from "../ui/input/text";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Button } from "../ui/button";
import { Loader2, VideoIcon } from "lucide-react";
import { useSupaMutation } from "@/src/hooks/use-supabase";

import { saveClass } from "@/src/data/class";
import FileDropzone from "../ui/input/file-dropzone";
import { useCallback, useState } from "react";
import { FileRejection } from "react-dropzone";
import { toast } from "../ui/use-toast";
import { useAsyncFileUpload } from "@/src/contexts/async-file-upload";
import { BUCKETS } from "@/src/consts/storage";

const formSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Title is required.",
    })
    .max(50, {
      message: "Title must be at most 50 characters.",
    }),
  description: z
    .string()
    .max(250, {
      message: "Description must be at most 250 characters.",
    })
    .nullable(),
  price: z
    .number({ invalid_type_error: "Price cannot be empty." })
    .positive({
      message: "Price must be a positive number.",
    })
    .transform((val) => val * 100),
});

type SaveClassFormProps = {
  defaultValues?: Partial<SaveClassFormSchemaType>;
  onSubmitted: () => void;
};

export type SaveClassFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
};

export default function SaveClassForm({
  defaultValues,
  onSubmitted,
}: SaveClassFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SaveClassFormSchemaType>({
    defaultValues: {
      ...defaultValues,
      price: defaultValues?.price ? defaultValues.price / 100 : undefined,
    },
    resolver: zodResolver(formSchema),
  });
  const asyncUploader = useAsyncFileUpload();
  const { currentBusiness } = useCurrentBusinessContext();
  const { mutate: _saveClass, isPending } = useSupaMutation(saveClass, {
    invalidate: [["listClasses"], ["getClasss", currentBusiness.id]],
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create class",
        description: error.message,
      });
    },
    onSuccess: async (data) => {
      if (previewFile !== null && classFile !== null) {
        asyncUploader.upload({
          id: data.id,
          targets: [
            {
              file: previewFile!,
              bucketName: BUCKETS.classes,
              objectName: `${data.id}/preview`,
              contentType: previewFile!.type,
            },
            {
              file: classFile!,
              bucketName: BUCKETS.classes,
              objectName: `${data.id}/class`,
              contentType: classFile!.type,
            },
          ],
        });
      }
    },
    onSettled: () => {
      onSubmitted();
    },
  });
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [classFile, setClassFile] = useState<File | null>(null);

  const onPreviewVideoDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        toast({
          variant: "destructive",
          title: "File doesn't meet requirements",
          description:
            "Please make sure the file is a video and meet size requirements.",
        });
        return;
      }
      setPreviewFile(accepted[0]);
    },
    [],
  );

  const onClassVideoDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        toast({
          variant: "destructive",
          title: "File doesn't meet requirements",
          description:
            "Please make sure the file is a video and meet size requirements.",
        });
        return;
      }
      setClassFile(accepted[0]);
    },
    [],
  );

  const onFormSuccess = (formValues: SaveClassFormSchemaType) => {
    _saveClass({
      danceClass: {
        ...(defaultValues?.id ? { id: defaultValues.id } : {}), // if id exists, then we are editing an existing service  (not creating a new one)
        ...formValues,
        business_id: currentBusiness.id,
      },
      priceChanged: defaultValues?.price !== formValues.price,
      titleChanged: defaultValues?.title !== formValues.title,
    });
  };

  const onFormErrors = (errors: any) => {
    console.log("ERRORS", errors);
  };

  return (
    <form
      className="flex flex-col gap-y-3"
      onSubmit={handleSubmit(onFormSuccess, onFormErrors)}
    >
      <InputText
        rhfKey="title"
        register={register}
        error={errors.title?.message}
        inputProps={{ placeholder: "Title" }}
        description="e.g. Groove Training"
        label="Title"
      />
      <InputText
        rhfKey="description"
        register={register}
        error={errors.description?.message}
        inputProps={{ placeholder: "Description" }}
        description="This class goes over the foundation of Hip Hop Grooves."
        label="Description"
      />
      <InputText
        rhfKey="price"
        register={register}
        registerOptions={{ valueAsNumber: true }}
        error={errors.price?.message}
        inputProps={{ placeholder: "Price", type: "number", step: "any" }}
        className="pr-0"
        prefix={<span className="mr-1 text-sm text-muted-foreground">$</span>}
        label="Price"
      />
      <div className="col-span-full">
        <label
          htmlFor="cover-photo"
          className="block text-sm font-medium leading-6 text-foreground"
        >
          Preview video
        </label>

        <FileDropzone
          onDrop={onPreviewVideoDrop}
          options={{
            accept: { "video/*": [] },
            multiple: false,
          }}
          defaultIcon={
            <VideoIcon
              className="mx-auto h-12 w-12 text-muted-foreground"
              aria-hidden="true"
            />
          }
        />
      </div>
      <div className="col-span-full">
        <label
          htmlFor="cover-photo"
          className="block text-sm font-medium leading-6 text-foreground"
        >
          Class video
        </label>

        <FileDropzone
          onDrop={onClassVideoDrop}
          options={{
            accept: { "video/*": [] },
            multiple: false,
          }}
          defaultIcon={
            <VideoIcon
              className="mx-auto h-12 w-12 text-muted-foreground"
              aria-hidden="true"
            />
          }
        />
      </div>
      <Button className="float-right mt-6" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : "Save"}
      </Button>
    </form>
  );
}
