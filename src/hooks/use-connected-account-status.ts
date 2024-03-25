import { Tables } from "@/types/db";
import { useEffect, useState } from "react";
import { getStripeAccount } from "../data/stripe";

type StripeRequirements = {
  //https://docs.stripe.com/api/persons/object#person_object-requirements
  currently_due: string[];
  past_due: string[];
  eventually_due: string[];
};

export enum StripeStatus {
  HasCurrentlyDueRequirements,
  HasPastDueRequirements,
  HasEventuallyDueRequirements,
  OnboardingNotInitiated,
  IsReady,
  Unknown,
}

const STRIPE_STATUS_TITLES: { [key: number]: string } = {
  [StripeStatus.OnboardingNotInitiated]: "Set up payment",
  [StripeStatus.HasCurrentlyDueRequirements]: "Payment set up incomplete",
  [StripeStatus.HasPastDueRequirements]: "Your payment profile is disabled",
  [StripeStatus.HasEventuallyDueRequirements]: "Payment set up incomplete",
};

const STRIPE_STATUS_DESCRIPTIONS: { [key: number]: string } = {
  [StripeStatus.OnboardingNotInitiated]:
    "You must first set up payment to start!",
  [StripeStatus.HasCurrentlyDueRequirements]:
    "You must first complete your payment profile to start receiving payments.",
  [StripeStatus.HasPastDueRequirements]:
    "You must first complete your payment profile to start receiving payments.",
  [StripeStatus.HasEventuallyDueRequirements]:
    "You must first complete your payment profile to start receiving payments.",
};

export const useConnectedAccountStatus = (business: Tables<"businesses">) => {
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<StripeStatus>(StripeStatus.Unknown);
  const [statusTitle, setStatusTitle] = useState<string>("");
  const [statusDescription, setStatusDescription] = useState<string>("");

  const setStatusData = (status: StripeStatus) => {
    setStatus(status);
    setStatusTitle(STRIPE_STATUS_TITLES[status] || "");
    setStatusDescription(STRIPE_STATUS_DESCRIPTIONS[status] || "");
  };

  useEffect(() => {
    const checkIfAccountIsReady = async () => {
      if (!business.stripe_account_id) {
        setIsLoading(false);
        setStatusData(StripeStatus.OnboardingNotInitiated);
        return;
      }

      try {
        const account = await getStripeAccount(business.stripe_account_id);
        const { currently_due, past_due, eventually_due } =
          account.requirements as StripeRequirements;
        if (currently_due.length > 0) {
          setStatusData(StripeStatus.HasCurrentlyDueRequirements);
        } else if (past_due.length > 0) {
          setStatusData(StripeStatus.HasPastDueRequirements);
        } else if (eventually_due.length > 0) {
          setStatusData(StripeStatus.HasEventuallyDueRequirements);
        } else {
          setStatusData(StripeStatus.IsReady);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    checkIfAccountIsReady();
  }, [business]);

  return {
    isLoading,
    status,
    statusTitle,
    statusDescription,
  };
};
