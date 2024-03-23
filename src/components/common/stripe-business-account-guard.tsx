"use client";

import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import {
  StripeStatus,
  useConnectedAccountStatus,
} from "@/src/hooks/use-connected-account-status";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Spinner } from "./loading-spinner";

export default function StripeBusinessAccountGuard({
  children,
}: {
  children?: any;
}) {
  const { currentBusiness } = useCurrentBusinessContext();

  const {
    status: accountStatus,
    statusTitle: accountStatusTitle,
    statusDescription: accountStatusDescription,
    isLoading: isCheckingIfPaymentReady,
  } = useConnectedAccountStatus(currentBusiness);
  if (isCheckingIfPaymentReady) {
    return <Spinner />;
  }

  if (accountStatus !== StripeStatus.IsReady) {
    return (
      <Alert variant="default">
        <AlertTitle>{accountStatusTitle}</AlertTitle>
        <AlertDescription>{accountStatusDescription}</AlertDescription>
        <Button
          className="mt-6"
          onClick={async () => {
            const resp = await fetch(
              `/api/stripe/onboard?businessId=${currentBusiness.id}&onSuccessReturnUrl=${window.location.href}`,
            );
            const json = await resp.json();
            window.location.href = json.url;
          }}
        >
          Start
        </Button>
      </Alert>
    );
  }
  return children;
}
