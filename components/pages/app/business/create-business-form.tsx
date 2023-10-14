import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";

export default function CreateBusinessForm({ onBack }: { onBack: () => void }) {
  return (
    <form>
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
              <label
                htmlFor="handle"
                className="block text-sm font-medium leading-6 text-foreground"
              >
                Business handle
              </label>
              <div className="flex items-center">
                <span className="mt-1 flex select-none items-center pr-3 text-sm text-muted-foreground">
                  webook.com/
                </span>
                <Input
                  type="text"
                  name="handle"
                  id="handle"
                  autoComplete="handle"
                  placeholder="janesmith"
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <Input
                type="text"
                label="Title"
                name="title"
                id="title"
                autoComplete="title"
                placeholder="The business title your customers will see."
              />
            </div>
            <div className="sm:col-span-3">
              <Input
                type="text"
                label="Email"
                name="email"
                id="email"
                autoComplete="email"
                placeholder="Your business contact email address."
              />
            </div>
            <div className="sm:col-span-3">
              <Input
                type="text"
                label="Phone"
                name="phone"
                id="phone"
                autoComplete="phone"
                placeholder="Your business contact phone number."
              />
            </div>

            <div className="col-span-full">
              <div className="mt-2">
                <Textarea
                  label="Description"
                  id="about"
                  name="about"
                  rows={3}
                  defaultValue={""}
                  placeholder="Briefly describe what your business does."
                />
              </div>
            </div>
            <div className="sm:col-span-full">
              <Input
                type="text"
                label="Address"
                name="address"
                id="address"
                autoComplete="address"
                placeholder="The address line 1 of your business."
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                type="text"
                label="City"
                name="city"
                id="city"
                autoComplete="city"
                placeholder="City"
              />
            </div>
            <div className="sm:col-span-1">
              <Input
                type="text"
                label="State"
                name="state"
                id="state"
                autoComplete="state"
                placeholder="State"
              />
            </div>
            <div className="sm:col-span-1">
              <Input
                type="text"
                label="Zip"
                name="zip"
                id="zip"
                autoComplete="zip"
                placeholder="Zip"
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                type="text"
                label="Country"
                name="country"
                id="country"
                autoComplete="country"
                placeholder="Country"
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
