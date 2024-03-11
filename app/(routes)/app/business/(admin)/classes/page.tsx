"use client";

import { SaveClassDialog } from "@/src/components/dialogs/save-class-dialog";
import { SaveClassFormSchemaType } from "@/src/components/forms/save-class-form";
import EmptyState from "@/src/components/shared/empty-state";
import StripeBusinessAccountGuard from "@/src/components/shared/stripe-business-account-guard";
import { Button } from "@/src/components/ui/button";
import { listClasses } from "@/src/data/class";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { Edit } from "lucide-react";
import { useState } from "react";

type ClassDialogState = {
  isOpen: boolean;
  initFormValues?: Partial<SaveClassFormSchemaType>;
};

export default function Classes() {
  const { data, isLoading } = useSupaQuery(listClasses, undefined, {
    queryKey: ["listClasses"],
  });
  const [dialogState, setDialogState] = useState<ClassDialogState>({
    isOpen: false,
  });

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <StripeBusinessAccountGuard>
      <SaveClassDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false })}
        initFormValues={dialogState.initFormValues}
      />
      {!data || data.length === 0 ? (
        <div>
          <EmptyState
            title="No classes"
            description="You don't have any classes yet. Create your first class to get started."
            actionButtonText="Create class"
            onAction={() => {
              setDialogState({ isOpen: true });
            }}
          />
        </div>
      ) : (
        <>
          {data.map((danceClass) => {
            return (
              <div key={danceClass.id}>
                <>{danceClass.title}</>
                <Button
                  onClick={() => {
                    setDialogState({
                      isOpen: true,
                      initFormValues: danceClass,
                    });
                  }}
                >
                  <Edit />
                </Button>
              </div>
            );
          })}
          <div>
            <Button
              onClick={() => {
                setDialogState({ isOpen: true });
              }}
            >
              Create class
            </Button>
          </div>
        </>
      )}
    </StripeBusinessAccountGuard>
  );
}
