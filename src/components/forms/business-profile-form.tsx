"use client";
import { Button } from "@/src/components/ui/button";
import InputAddress from "@/src/components/ui/input/address";
import FileDropzone from "@/src/components/ui/input/file-dropzone";
import InputMask from "@/src/components/ui/input/mask";
import InputSelect from "@/src/components/ui/input/select";
import InputText from "@/src/components/ui/input/text";
import InputTextArea from "@/src/components/ui/input/textarea";
import { toast } from "@/src/components/ui/use-toast";
import { countries } from "@/src/consts/countries";
import { BUCKETS } from "@/src/consts/storage";
import { supaClientComponentClient } from "@/src/api/clients/browser";
import { Tables } from "@/types/db.extension";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useDebounce } from "usehooks-ts";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

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
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length > 9, { message: "Invalid phone number." }),
  description: z
    .string()
    .min(1, { message: "Description is required." })
    .max(200, { message: "Description must be at most 200 characters." }),
  address: z.string().min(1, { message: "Address is required." }),
  city: z.string().min(1, { message: "City is required." }),
  state: z.string().min(1, { message: "State is required." }),
  zip: z.string().min(1, { message: "Zip code is required." }),
  country_code: z.string().min(1, { message: "Country code is required." }),
});

type FormSchemaType = z.infer<typeof formSchema>;

const FILE_SIZE_LIMIT = 1000000; // 1MB in bytes

export default function BusinessProfileForm({
  onBack,
  business,
  loggedInUser,
}: {
  onBack?: () => void;
  business?: Tables<"business">;
  loggedInUser: User;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
  });
  const router = useRouter();
  const logoRef = useRef<HTMLInputElement>(null);

  const [logoFile, setLogoFile] = useState<File>();
  const [coverPhotoFile, setCoverPhotoFile] = useState<File>();
  const [handle, setHandle] = useState<string>("");
  const [handleExists, setHandleExists] = useState<boolean>(false);
  const debouncedHandleValue = useDebounce<string>(handle, 1000);

  useEffect(() => {
    if (debouncedHandleValue) {
      (async () => {
        const exists = await checkIfHandleExists(debouncedHandleValue);
        if (exists) {
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
  }, [debouncedHandleValue]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0].size > FILE_SIZE_LIMIT) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 1MB.",
      });
      return;
    }
    setCoverPhotoFile(acceptedFiles[0]);
  }, []);

  const onLogoFileChange = useCallback((e: any) => {
    const file = e.target.files[0];
    if (file.size > FILE_SIZE_LIMIT) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 1MB.",
      });
      return;
    }
    setLogoFile(file);
  }, []);

  async function checkIfHandleExists(handle: string) {
    try {
      const { count } = await supaClientComponentClient()
        .from("business")
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
    if (!logoFile || !coverPhotoFile) {
      toast({
        variant: "destructive",
        title: "Missing file",
        description: "Please upload a logo and cover photo.",
      });
      return;
    }
    try {
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

      const results = await Promise.all([
        supaClientComponentClient()
          .storage.from(BUCKETS.publicBusinessAssets)
          .upload(`/logos/${values.handle}`, logoFile),
        supaClientComponentClient()
          .storage.from(BUCKETS.publicBusinessAssets)
          .upload(`/cover-photos/${values.handle}`, coverPhotoFile),
        supaClientComponentClient()
          .from("business")
          .upsert({ ...values, owner_id: loggedInUser.id }),
      ]);

      for (const result of results) {
        if (result.error) {
          throw result.error;
        }
      }
      // todo - celebrate with a toast.
      router.replace("/app/business/schedule");
    } catch (err) {
      console.log(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    }
  }

  function onFormError() {
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
  }

  return (
    <form onSubmit={handleSubmit(onFormSuccess, onFormError)}>
      <div className="space-y-12">
        <div className="border-b border-foreground/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-foreground">
            Profile
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            This information will be displayed publicly so be careful what you
            share.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <InputText
                label="Business handle"
                prefix={
                  <span className="select-none pr-2 text-sm text-muted-foreground">
                    webook.com/
                  </span>
                }
                rhfKey="handle"
                register={register}
                inputProps={{
                  placeholder: "janesmith",
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
                  placeholder: "Smith Car Wash",
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
                  placeholder: "janesmith@gmail.com",
                }}
                error={errors.email?.message}
              />
            </div>
            <div className="sm:col-span-3">
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
            </div>

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
            <div className="sm:col-span-full">
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
                  placeholder: "123 Main St",
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
                  placeholder: "Los Angeles",
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
                  placeholder: "CA",
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
                  placeholder: "United States",
                }}
                error={errors.country_code?.message}
              />
            </div>

            <div className="col-span-full">
              <label
                htmlFor="logo"
                className="block text-sm font-medium leading-6 text-foreground"
              >
                Logo
              </label>
              <div className="mt-2 flex items-center gap-x-3">
                {logoFile ? (
                  <div className="flex-shrink-0">
                    <img
                      src={URL.createObjectURL(logoFile)}
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

            <div className="col-span-full">
              <label
                htmlFor="cover-photo"
                className="block text-sm font-medium leading-6 text-foreground"
              >
                Cover photo
              </label>

              <FileDropzone
                onDrop={onDrop}
                defaultIcon={
                  <PhotoIcon
                    className="mx-auto h-12 w-12 text-muted-foreground"
                    aria-hidden="true"
                  />
                }
              />
            </div>
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
              router.replace("/app/business/schedule");
            }
          }}
        >
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
