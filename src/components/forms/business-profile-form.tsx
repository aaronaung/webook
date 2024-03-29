"use client";
import { Button } from "@/src/components/ui/button";
import InputText from "@/src/components/ui/input/text";
import InputTextArea from "@/src/components/ui/input/textarea";
import { toast } from "@/src/components/ui/use-toast";
import { BUCKETS, STORAGE_DIR_PATHS } from "@/src/consts/storage";
import { supaClientComponentClient } from "@/src/data/clients/browser";
import { Tables } from "@/types/db.extension";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useDebounce } from "usehooks-ts";
import { PostgrestError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { FileRejection } from "react-dropzone";
import { UNIQUE_CONSTRAINT_VIOLATION } from "@/src/consts/postgres-errors";
import { sidebarNavigation } from "@/app/(routes)/app/business/navigation";

const formSchema = z.object({
  handle: z
    .string()
    .min(1, { message: "Handle must be at least 1 character." })
    .max(25, { message: "Handle must be at most 25 characters." })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Handle must be alphanumeric." }),
  title: z
    .string()
    .min(1, { message: "Title is required." })
    .max(25, { message: "Title must be at most 25 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  // phone: z
  //   .string()
  //   .min(10, { message: "Phone number must be at least 10 digits." })
  //   .transform((val) => val.replace(/\D/g, ""))
  //   .refine((val) => val.length > 9, { message: "Invalid phone number." }),
  description: z
    .string()
    .min(1, { message: "Description is required." })
    .max(200, { message: "Description must be at most 200 characters." })
    .nullable(),
  instagram_handle: z.string().optional().nullable(),
  facebook_link: z.string().optional().nullable(),
  // address: z.string().min(1, { message: "Address is required." }),
  // city: z.string().min(1, { message: "City is required." }),
  // state: z.string().min(1, { message: "State is required." }),
  // zip: z.string().min(1, { message: "Zip code is required." }),
  // country_code: z.string().min(1, { message: "Country code is required." }),
});

type FormSchemaType = z.infer<typeof formSchema>;

const FILE_SIZE_LIMIT = 5000000; // 5MB in bytes

export default function BusinessProfileForm({
  defaultValues,
  onBack,
  loggedInUser,
}: {
  defaultValues?: FormSchemaType & { id: string; logoUrl?: string };
  onBack?: () => void;
  loggedInUser: Tables<"users">;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaType>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const router = useRouter();
  const logoRef = useRef<HTMLInputElement>(null);

  const [logoFile, setLogoFile] = useState<File>();
  const [coverPhotoFile, setCoverPhotoFile] = useState<File>();
  const [handle, setHandle] = useState<string>(defaultValues?.handle || "");
  const [handleExists, setHandleExists] = useState<boolean>(false);
  const debouncedHandleValue = useDebounce<string>(handle, 1000);
  const [isSaving, setIsSaving] = useState(false);
  const isAnUpdate = !!defaultValues;

  useEffect(() => {
    if (debouncedHandleValue) {
      (async () => {
        const exists = await checkIfHandleExists(debouncedHandleValue);
        if (exists && !(isAnUpdate && handle === defaultValues.handle)) {
          setError("handle", {
            message: "This handle is already taken.",
            type: "custom",
          });
          setHandleExists(true);
        } else {
          clearErrors("handle");
          setHandleExists(false);
        }
      })();
    } else {
      clearErrors("handle");
      setHandleExists(false);
    }
  }, [clearErrors, debouncedHandleValue, setError]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        for (const rejection of rejectedFiles) {
          if (rejection.errors[0].code === "file-too-large") {
            toast({
              variant: "destructive",
              title: "File too large",
              description: "Please upload a file smaller than 5MB.",
            });
            return;
          }
        }
      }
      setCoverPhotoFile(acceptedFiles[0]);
    },
    [],
  );

  const onLogoFileChange = useCallback((e: any) => {
    const file = e.target.files[0];
    if (file.size > FILE_SIZE_LIMIT) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
      });
      return;
    }
    setLogoFile(file);
  }, []);

  const renderLogoPreview = () => {
    if (logoFile) {
      return (
        <img
          src={URL.createObjectURL(logoFile)}
          alt="Logo"
          className="h-12 w-12 rounded-full object-cover"
        />
      );
    }
    if (defaultValues?.logoUrl) {
      return (
        <img
          src={defaultValues.logoUrl}
          alt="Logo"
          className="h-12 w-12 rounded-full object-cover"
        />
      );
    }
    return (
      <UserCircleIcon
        className="h-12 w-12 text-muted-foreground"
        aria-hidden="true"
      />
    );
  };

  async function checkIfHandleExists(handle: string) {
    try {
      const { count } = await supaClientComponentClient
        .from("businesses")
        .select("*", { count: "exact", head: true })
        .eq("handle", handle);

      return count && count > 0;
    } catch (error) {
      console.log(error);
      // we can't check if the handle exists, so we'll just assume it does to err on the safe side.
      return true;
    }
  }

  async function onFormSuccess(values: FormSchemaType) {
    if (!defaultValues?.logoUrl && !logoFile) {
      toast({
        variant: "destructive",
        title: "Missing file",
        description:
          "Please upload your headshot. This will show up in the header of your page.",
      });
      return;
    }
    try {
      setIsSaving(true);
      if (handleExists && !(isAnUpdate && handle === defaultValues.handle)) {
        setError(
          "handle",
          {
            message: "This handle is already taken.",
            type: "custom",
          },
          {
            shouldFocus: true,
          },
        );
        toast({
          variant: "destructive",
          title: "Handle already exists",
          description: "Please choose a different handle.",
        });
        return;
      }

      const promises: any[] = [
        supaClientComponentClient.from("businesses").upsert({
          ...values,
          owner_id: loggedInUser.id,
          id: defaultValues?.id,
        }),
      ];
      if (logoFile) {
        promises.push(
          supaClientComponentClient.storage
            .from(BUCKETS.publicBusinessAssets)
            .upload(
              `/${STORAGE_DIR_PATHS.businessLogos}/${values.handle}`,
              logoFile,
              {
                upsert: true,
              },
            ),
        );
      }
      console.log(promises);
      const results = await Promise.all(promises);
      for (const result of results) {
        if (result.error) {
          throw result.error;
        }
      }
      setIsSaving(false);
      // todo - celebrate with a toast.
      if (isAnUpdate) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated.",
        });
      } else {
        router.replace("/app/business/classes");
      }
    } catch (err) {
      console.log(err);
      if ((err as PostgrestError).code === UNIQUE_CONSTRAINT_VIOLATION) {
        toast({
          variant: "destructive",
          title: "Handle already exists",
          description: "Please choose a different handle.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong. Please try again.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  }

  function onFormError(err: any) {
    if (handleExists) {
      setError(
        "handle",
        {
          message: "This handle is already taken.",
          type: "custom",
        },
        {
          shouldFocus: true,
        },
      );
      toast({
        variant: "destructive",
        title: "Handle already exists",
        description: "Please choose a different handle.",
      });
      return;
    }
    console.error(err);
  }

  return (
    <form onSubmit={handleSubmit(onFormSuccess, onFormError)}>
      <div className="space-y-12">
        <div className="border-b border-foreground/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-foreground">
            Instructor profile
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <InputText
                label="Handle"
                prefix={
                  <span className="select-none pr-2 text-sm text-muted-foreground">
                    webook.com/
                  </span>
                }
                rhfKey="handle"
                register={register}
                inputProps={{
                  placeholder: "This is your unique business handle",
                }}
                onChange={(e) => setHandle(e.target.value)}
                error={errors.handle?.message}
              />
            </div>
            <div className="sm:col-span-3">
              <InputText
                rhfKey="title"
                register={register}
                label="Title"
                inputProps={{
                  placeholder: "The title to display on your landing page",
                }}
                error={errors.title?.message}
              />
            </div>
            <div className="sm:col-span-3">
              <InputText
                rhfKey="email"
                register={register}
                label="Email"
                inputProps={{
                  autoComplete: "email",
                  placeholder: "Email address",
                }}
                error={errors.email?.message}
              />
            </div>
            <div className="sm:col-span-3">
              <InputText
                rhfKey="instagram_handle"
                register={register}
                label="Instagram handle"
                inputProps={{
                  placeholder: "Instagram handle (don't include @). e.g. moovn",
                }}
                error={errors.email?.message}
              />
            </div>
            <div className="sm:col-span-3">
              <InputText
                rhfKey="facebook_link"
                register={register}
                label="Facebook link"
                inputProps={{
                  placeholder:
                    "Link to Facebook page. e.g. https://facebook.com/moovn",
                }}
                error={errors.email?.message}
              />
            </div>
            {/* <div className="sm:col-span-3">
              <InputMask
                rhfKey="phone"
                register={register}
                maskProps={{
                  mask: "(999) 999-9999",
                  placeholder: "(000) 000-0000",
                  alwaysShowMask: false,
                }}
                label="Phone"
                error={errors.phone?.message}
              />
            </div> */}

            <div className="col-span-full">
              <div className="mt-2">
                <InputTextArea
                  rhfKey="description"
                  register={register}
                  label="Description"
                  textareaProps={{
                    rows: 3,
                    placeholder: "Briefly describe what your business does.",
                  }}
                  error={errors.description?.message}
                />
              </div>
            </div>
            {/* <div className="sm:col-span-full">
              <InputAddress
                rhfKey="address"
                onPlaceSelected={(location) => {
                  setValue("city", location.city);
                  setValue("state", location.state);
                  setValue("zip", location.zip);
                  trigger(["city", "state", "zip"]);
                }}
                control={control}
                label="Address"
                inputProps={{
                  placeholder: "Address line",
                  autoComplete: "address",
                }}
                error={errors.address?.message}
              />
            </div>
            <div className="sm:col-span-2">
              <InputText
                rhfKey="city"
                register={register}
                label="City"
                inputProps={{
                  placeholder: "City",
                }}
                error={errors.city?.message}
              />
            </div>
            <div className="sm:col-span-1">
              <InputText
                rhfKey="state"
                register={register}
                label="State"
                inputProps={{
                  placeholder: "State",
                }}
                error={errors.state?.message}
              />
            </div>
            <div className="sm:col-span-1">
              <InputMask
                maskProps={{ mask: "99999", placeholder: "12345" }}
                rhfKey="zip"
                register={register}
                label="Zip"
                error={errors.zip?.message}
              />
            </div>
            <div className="sm:col-span-2">
              <InputSelect
                rhfKey="country_code"
                control={control}
                options={countries.map((country) => ({
                  label: country.name,
                  value: country.code,
                }))}
                label="Country"
                inputProps={{
                  placeholder: "Country",
                }}
                error={errors.country_code?.message}
              />
            </div> */}

            <div className="col-span-full">
              <label
                htmlFor="headshot"
                className="block text-sm font-medium leading-6 text-foreground"
              >
                Headshot
              </label>
              <div className="mt-2 flex items-center gap-x-3">
                {renderLogoPreview()}
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onLogoFileChange}
                />
                <Button
                  type="button"
                  className="bg-secondary text-foreground hover:bg-secondary/80"
                  onClick={() => {
                    logoRef.current?.click();
                  }}
                >
                  {logoFile ? "Change" : "Upload"}
                </Button>
              </div>
            </div>

            {/* <div className="col-span-full">
              <label
                htmlFor="cover-photo"
                className="block text-sm font-medium leading-6 text-foreground"
              >
                Cover photo
              </label>

              <FileDropzone
                onDrop={onDrop}
                options={{
                  accept: { "image/*": [] },
                  multiple: false,
                  maxSize: FILE_SIZE_LIMIT,
                }}
                defaultIcon={
                  <PhotoIcon
                    className="mx-auto h-12 w-12 text-muted-foreground"
                    aria-hidden="true"
                  />
                }
              />
            </div> */}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-4">
        <Button
          type="button"
          className="bg-secondary text-foreground hover:bg-secondary/90"
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              router.replace(sidebarNavigation[0].href);
            }
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          Save
        </Button>
      </div>
    </form>
  );
}
