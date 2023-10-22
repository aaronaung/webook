import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import InputText from "../ui/input/text";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "../ui/use-toast";

import { BUCKETS } from "@/src/consts/storage";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import Image from "../ui/image";
import { getTimestampedObjUrl } from "@/src/utils";

const formSchema = z.object({
  first_name: z
    .string()
    .min(1, { message: "First name is required." })
    .max(25, { message: "First name must be at most 25 characters." }),
  last_name: z
    .string()
    .min(1, { message: "Last name is required." })
    .max(25, { message: "Last name must be at most 25 characters." }),
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email address." })
    .max(50, { message: "Email must be at most 50 characters." }),
  instagram_handle: z
    .string()
    .max(25, { message: "Instagram handle must be at most 25 characters." }),
});

type SaveStaffFromProps = {
  defaultValues?: SaveStaffFormSchemaType;
  onFormSuccess: (
    formValues: SaveStaffFormSchemaType,
    headshotFile?: File,
  ) => void;
};

export type SaveStaffFormSchemaType = z.infer<typeof formSchema> & {
  id?: string;
  updated_at?: string;
};

const HEADSHOT_FILE_SIZE_LIMIT = 1000000; // 1MB in bytes;

const SaveStaffForm = React.forwardRef<HTMLFormElement, SaveStaffFromProps>(
  ({ defaultValues, onFormSuccess }, ref) => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<SaveStaffFormSchemaType>({
      defaultValues: defaultValues,
      resolver: zodResolver(formSchema),
    });

    const [headshotFile, setHeadshotFile] = useState<File | undefined>();
    const [headshotFileChanged, setHeadshotFileChanged] = useState(false);
    const headshotRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const setAvatarBlob = async (headshotUrl: string) => {
        const imgExt = headshotUrl.split(".").pop();
        const response = await fetch(headshotUrl);
        if (response.status > 299) {
          return;
        }
        const blob = await response.blob();
        const file = new File([blob], "head_shot." + imgExt, {
          type: blob.type,
        });
        setHeadshotFile(file);
      };

      if (defaultValues?.id) {
        const headshotUrl = getTimestampedObjUrl(
          BUCKETS.publicBusinessAssets,
          `staff_headshots/${defaultValues?.id}`,
          defaultValues?.updated_at,
        );
        setAvatarBlob(headshotUrl);
      }
    }, [defaultValues?.id]);

    const onHeadshotFileChange = useCallback((e: any) => {
      setHeadshotFileChanged(true);
      const file = e.target.files[0];
      if (file && file.size > HEADSHOT_FILE_SIZE_LIMIT) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file smaller than 1MB.",
        });
        return;
      }
      setHeadshotFile(file);
    }, []);

    const handleOnFormSuccess = async (formValues: SaveStaffFormSchemaType) => {
      onFormSuccess(formValues, headshotFileChanged ? headshotFile : undefined);
    };

    return (
      <form ref={ref} onSubmit={handleSubmit(handleOnFormSuccess)}>
        <InputText
          rhfKey="first_name"
          register={register}
          error={errors.first_name?.message}
          inputProps={{ placeholder: "First name" }}
          label="First name"
        />
        <InputText
          rhfKey="last_name"
          register={register}
          error={errors.last_name?.message}
          inputProps={{ placeholder: "Last name" }}
          label="Last name"
        />
        <InputText
          rhfKey="email"
          register={register}
          error={errors.email?.message}
          inputProps={{ placeholder: "Email" }}
          label="Email"
        />
        <InputText
          rhfKey="instagram_handle"
          register={register}
          error={errors.instagram_handle?.message}
          inputProps={{ placeholder: "Instagram handle" }}
          label="Instagram handle"
        />
        <Label className="leading-4" htmlFor={"headshot-upload"}>
          Headshot
        </Label>
        <div className="mt-2 flex items-center gap-x-3">
          {headshotFile ? (
            <div className="flex-shrink-0">
              <Image
                id="headshot-upload"
                src={URL.createObjectURL(headshotFile)}
                alt="Logo"
                className="h-12 w-12 rounded-full object-cover"
              />
            </div>
          ) : (
            <UserCircleIcon
              className="h-12 w-12 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <input
            ref={headshotRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onHeadshotFileChange}
          />
          <Button
            type="button"
            className="bg-secondary text-foreground hover:bg-secondary/80"
            onClick={() => {
              headshotRef.current?.click();
            }}
          >
            {headshotFile ? "Change" : "Upload"}
          </Button>
        </div>
      </form>
    );
  },
);

export default SaveStaffForm;
