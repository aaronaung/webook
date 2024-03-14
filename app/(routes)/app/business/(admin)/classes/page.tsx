"use client";

import { SaveClassDialog } from "@/src/components/dialogs/save-class-dialog";
import { SaveClassFormSchemaType } from "@/src/components/forms/save-class-form";
import ClassCard from "@/src/components/shared/class-card";
import EmptyState from "@/src/components/shared/empty-state";
import StripeBusinessAccountGuard from "@/src/components/shared/stripe-business-account-guard";
import { Button } from "@/src/components/ui/button";
import { listClasses } from "@/src/data/class";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { PlusIcon } from "@heroicons/react/24/solid";
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
        <div className="relative mb-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {data.map((danceClass) => {
              return (
                <div className="" key={danceClass.id}>
                  <ClassCard
                    danceClass={danceClass}
                    footerActionButton={
                      <Button
                        className="p-3"
                        variant={"secondary"}
                        onClick={() => {
                          setDialogState({
                            isOpen: true,
                            initFormValues: danceClass,
                          });
                        }}
                      >
                        <Edit width={20} />
                      </Button>
                    }
                  />
                </div>
              );
            })}
          </div>

          <Button
            onClick={() => {
              setDialogState({
                isOpen: true,
              });
            }}
            className="fixed bottom-6 right-8 h-16 w-16 rounded-full"
          >
            <PlusIcon width={28} />
          </Button>
        </div>
      )}
    </StripeBusinessAccountGuard>
  );
}
