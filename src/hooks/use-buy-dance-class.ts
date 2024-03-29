import { Tables } from "@/types/db";
import { toast } from "../components/ui/use-toast";
import { createStripeCheckoutSession } from "../data/stripe";
import { useRouter } from "next/navigation";

export const useBuyDanceClass = ({
  user,
  business,
}: {
  user?: Tables<"users"> | null;
  business?: Tables<"businesses"> | null;
}) => {
  const router = useRouter();

  const buy = async (danceClass: Tables<"classes">) => {
    if (!danceClass.stripe_product_id || !user || !business) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to buy class ${danceClass.title}. Please reload the page and try again.`,
      });
      return;
    }

    if (!business.stripe_account_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `We've disabled purchases from this instructor. Please contact us for more details.`,
      });
      return;
    }

    const checkoutSession = await createStripeCheckoutSession({
      returnUrl: `${window.origin}/app/student/classes/${danceClass.id}`,
      businessStripeAccountId: business.stripe_account_id,
      productId: danceClass.stripe_product_id,
      userId: user.id,
    });

    if (!checkoutSession.url) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create checkout session for class ${danceClass.title}.`,
      });
      return;
    }
    router.push(checkoutSession.url);
  };

  return {
    buy,
  };
};
