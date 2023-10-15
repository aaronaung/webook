"use client";
import { Button } from "@/components/ui/button";
import InputAddress from "@/components/ui/input/address";
import FileDropzone from "@/components/ui/input/file-dropzone";
import InputMask from "@/components/ui/input/mask";
import InputSelect from "@/components/ui/input/select";
import InputText from "@/components/ui/input/text";
import InputTextArea from "@/components/ui/input/textarea";
import { toast } from "@/components/ui/use-toast";
import { countries } from "@/lib/consts/countries";
import { BUCKETS } from "@/lib/consts/storage";
import { supaClientComponentClient } from "@/lib/supabase/client-side";
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
  handle: z.string().min(1).max(25),
  title: z.string().min(1).max(25),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  description: z.string().min(1).max(1000),
  address: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  zip: z.string().min(1).max(100),
  country_code: z.string().min(1).max(100),
});

type FormSchemaType = z.infer<typeof formSchema>;

const FILE_SIZE_LIMIT = 1000000; // in bytes

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
        } else {
          clearErrors("handle");
        }
      })();
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

  async function handleFormSubmit(values: FormSchemaType) {
    if (!logoFile || !coverPhotoFile) {
      toast({
        variant: "destructive",
        title: "Missing file",
        description: "Please upload a logo and cover photo.",
      });
      return;
    }
    try {
      const handleExists = await checkIfHandleExists(values.handle);
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
        console.log(result);
        if (result.error) {
          throw result.error;
        }
      }
    } catch (err) {
      console.log(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
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
                      className="h-12 w-12 rounded-full"
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
              router.replace("/app/business");
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
