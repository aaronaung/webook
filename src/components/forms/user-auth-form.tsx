"use client";

import { supaClientComponentClient } from "@/src/data/clients/browser";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "@/src/components/ui/use-toast";
import InputText from "@/src/components/ui/input/text";
import InputShowHide from "@/src/components/ui/input/show-hide";
import { Button } from "../ui/button";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type FormSchemaType = z.infer<typeof formSchema>;

// todo - implement forgot password + remember me.
export default function UserAuthForm({
  returnPath = "/app/explore",
}: {
  returnPath?: string;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
  });

  async function handleEmailLogin(formValues: FormSchemaType) {
    try {
      const { data, error } =
        await supaClientComponentClient().auth.signInWithPassword({
          email: formValues.email,
          password: formValues.password,
        });
      if (error) {
        toast({
          variant: "destructive",
          title: "Sorry, we couldn't log you in 😔",
          description: error.message,
        });
      } else {
        console.log("logged in", data, returnPath);
        router.replace(returnPath);
      }
    } catch (error) {
      console.log("error logging in", error);
      toast({
        variant: "destructive",
        title: "Something went wrong!",
        description: "We were unable to log you in. Please try again.",
      });
    }
  }

  async function handleSignUp() {
    // https://supabase.com/docs/reference/javascript/auth-signup
    // @todo - turn on email confirmation in real environment
    const formValues = getValues();
    try {
      const { data, error } = await supaClientComponentClient().auth.signUp({
        email: formValues.email,
        password: formValues.password,
        options: {
          emailRedirectTo: `${location.origin}/api/auth/callback?return_path=${returnPath}`,
        },
      });
      if (error) {
        toast({
          variant: "destructive",
          title: "Sorry, we couldn't create an account for you 😔",
          description: error.message,
        });
      } else {
        toast({
          title: "Sign up successful 👋",
          variant: "success",
          description: "Please check your email for a confirmation link.",
        });
        reset();
      }
    } catch (error) {
      console.log("error signing up", error);
      toast({
        variant: "destructive",
        title: "Something went wrong!",
        description: "We were unable to log you in. Please try again.",
      });
    }
  }

  async function handleLoginWithGoogle() {
    try {
      const { data, error } =
        await supaClientComponentClient().auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${location.origin}/api/auth/callback?return_path=${returnPath}`,
          },
        });
      if (error) {
        toast({
          variant: "destructive",
          title: "Sorry, we couldn't log you in 😔",
          description: error.message,
        });
      }
    } catch (error) {
      console.log("error signing up", error);
      toast({
        variant: "destructive",
        title: "Something went wrong!",
        description: "We were unable to log you in. Please try again.",
      });
    }
  }

  function handleFormSubmit(formValues: FormSchemaType) {
    handleEmailLogin(formValues);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-12">
          <div className="grid grid-cols-1 gap-4">
            <div className="relative">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-secondary" />
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white px-6 text-secondary-foreground">
                  Recommended
                </span>
              </div>
            </div>
            <a
              onClick={() => handleLoginWithGoogle()}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-slate-100 px-3 py-2 text-white transition-colors hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9BF0]"
            >
              <Image
                className="h-6 w-6"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google logo"
                width={6}
                height={6}
              />
              <span className="text-sm font-semibold leading-6 text-black/80">
                Sign in with Google
              </span>
            </a>
          </div>
          <div>
            <div className="relative mt-6">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-secondary" />
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white px-6 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <form
              className="mt-6 space-y-4"
              onSubmit={handleSubmit(handleFormSubmit)}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-secondary-foreground"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <InputText
                    rhfKey="email"
                    register={register}
                    inputProps={{
                      autoComplete: "email",
                    }}
                    error={errors.email?.message}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-secondary-foreground"
                >
                  Password
                </label>
                <div className="mt-1">
                  <InputShowHide
                    rhfKey="password"
                    register={register}
                    inputProps={{
                      autoComplete: "current-password",
                    }}
                    error={errors.password?.message}
                  />
                </div>
              </div>

              {false && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-secondary text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-3 block text-sm leading-6 text-secondary-foreground"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm leading-6">
                    <a
                      href="#"
                      className="font-semibold text-primary hover:text-primary"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
              )}

              <div className="flex gap-x-2">
                <Button className="w-full" type="submit">
                  Sign in
                </Button>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSignUp();
                  }}
                >
                  Sign up
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
