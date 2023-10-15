import { Button } from "@/components/ui/button";
import InputAddress from "@/components/ui/input/address";
import InputMask from "@/components/ui/input/mask";
import InputSelect from "@/components/ui/input/select";
import InputText from "@/components/ui/input/text";
import InputTextArea from "@/components/ui/input/textarea";
import { countries } from "@/lib/consts/countries";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

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
  country: z.string().min(1).max(100),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function CreateBusinessForm({ onBack }: { onBack: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
  });

  async function handleFormSubmit(values: FormSchemaType) {
    console.log(values);
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
                rhfKey="country"
                control={control}
                options={countries.map((country) => ({
                  label: country.name,
                  value: country.code,
                }))}
                label="Country"
                inputProps={{
                  placeholder: "United States",
                }}
                error={errors.country?.message}
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
                <UserCircleIcon
                  className="h-12 w-12 text-muted-foreground"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  className="rounded-md bg-background px-2.5 py-1.5 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-muted hover:bg-gray-50"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="cover-photo"
                className="block text-sm font-medium leading-6 text-foreground"
              >
                Cover photo
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-foreground/25 px-6 py-10">
                <div className="text-center">
                  <PhotoIcon
                    className="mx-auto h-12 w-12 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-4">
        <Button
          type="button"
          className="bg-secondary text-foreground hover:bg-secondary/90"
          onClick={onBack}
        >
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
