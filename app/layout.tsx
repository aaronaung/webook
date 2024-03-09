import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryClient, QueryCache } from "@tanstack/react-query";
import ReactQueryProvider from "@/src/providers/react-query-provider";
import { Toaster } from "@/src/components/ui/toaster";
import { toast } from "@/src/components/ui/use-toast";
import ReactDnDProvider from "@/src/providers/react-dnd-provider";
import { TooltipProvider } from "@/src/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query?.meta?.errorMessage) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `${query.meta.errorMessage}: ${error.message}`,
        });
      }
    },
  }),
});

// const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-background">
      <body
        className={`${inter.className} ${
          process.env.NODE_ENV === "development" ? "debug-screens" : ""
        } h-full overscroll-none`}
      >
        {/* <Elements
          stripe={stripePromise}
          options={{
            // USING ELEMENTS ALLOW US TO HAVE CUSTOM STRIPE ELEMENTS FOR CHECKOUT
            // FOR NOW WE DON"T USE THIS.
            // SEE https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=checkout for more info.
            clientSecret: "",
          }}
        ></Elements> */}
        <ReactQueryProvider>
          <ReactDnDProvider>
            {/** todo: Dark mode doesn't work well with TailwindUI. Either make TailwindUI components work with shadcn or migrate to shadcn entirely */}
            {/* <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          > */}
            <TooltipProvider>{children}</TooltipProvider>
            {/* </ThemeProvider> */}
          </ReactDnDProvider>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
