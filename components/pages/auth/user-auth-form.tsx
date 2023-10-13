"use client";

import { supaClientComponentClient } from "@/lib/supabase/client-side";
import { useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";

type FormState = "sign-in" | "sign-up";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type FormSchemaType = z.infer<typeof formSchema>;

// todo - implement forgot password + remember me.
export default function UserAuthForm() {
  const [formState, setFormState] = useState<FormState>("sign-in");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
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
        router.replace("/dashboard");
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

  async function handleSignUp(formValues: FormSchemaType) {
    // https://supabase.com/docs/reference/javascript/auth-signup
    // @todo - turn on email confirmation in real environment
    try {
      const { data, error } = await supaClientComponentClient().auth.signUp({
        email: formValues.email,
        password: formValues.password,
        options: {
          emailRedirectTo: `${location.origin}/api/auth/callback`,
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
          description: "Please check your email for a confirmation link.",
        });
        reset();
        setFormState("sign-in");
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
          options: { redirectTo: `${location.origin}/api/auth/callback` },
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
    if (formState === "sign-in") {
      handleEmailLogin(formValues);
    } else {
      handleSignUp(formValues);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {formState === "sign-in"
            ? "Sign in to your account"
            : "Create an account"}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  {...register("email")}
                  error={errors.email?.message}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
              <div className="mt-2">
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  {...register("password")}
                  error={errors.password?.message}
                />
              </div>
            </div>

            {formState === "sign-in" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-3 block text-sm leading-6 text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm leading-6">
                  <a
                    href="#"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {formState === "sign-in" ? "Sign in" : "Sign up"}
              </button>
            </div>
          </form>

          <div>
            <div className="relative mt-10">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white px-6 text-gray-900">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <a
                onClick={() => handleLoginWithGoogle()}
                className="flex w-full items-center justify-center gap-3 rounded-md bg-slate-100 px-3 py-2 text-white transition-colors hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9BF0]"
              >
                <Image
                  className="h-6 w-6"
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="google logo"
                  width={6}
                  height={6}
                />
                <span className="text-sm font-semibold leading-6 text-black/80">
                  Google
                </span>
              </a>
            </div>
          </div>
        </div>

        {formState === "sign-in" && (
          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{" "}
            <a
              onClick={() => setFormState("sign-up")}
              className="cursor-pointer font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Start a 14 day free trial
            </a>
          </p>
        )}
        {formState === "sign-up" && (
          <p className="mt-10 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a
              onClick={() => setFormState("sign-in")}
              className="cursor-pointer font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </a>
          </p>
        )}
      </div>
    </div>
  );
}