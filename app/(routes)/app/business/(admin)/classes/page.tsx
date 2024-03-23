"use client";

import { SaveClassDialog } from "@/src/components/dialogs/save-class-dialog";
import { SaveClassFormSchemaType } from "@/src/components/forms/save-class-form";
import ClassCard from "@/src/components/common/class-card";
import EmptyState from "@/src/components/common/empty-state";
import StripeBusinessAccountGuard from "@/src/components/common/stripe-business-account-guard";
import { Button } from "@/src/components/ui/button";
import { deleteClass, listClasses } from "@/src/data/class";
import { useSupaMutation, useSupaQuery } from "@/src/hooks/use-supabase";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Edit } from "lucide-react";
import { useState } from "react";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { Spinner } from "@/src/components/common/loading-spinner";

type ClassDialogState = {
  isOpen: boolean;
  initFormValues?: Partial<SaveClassFormSchemaType>;
};

export default function Classes() {
  const { currentBusiness } = useCurrentBusinessContext();
  const { data, isLoading } = useSupaQuery(listClasses, {
    arg: currentBusiness.id,
    queryKey: ["listClasses"],
  });
  const [dialogState, setDialogState] = useState<ClassDialogState>({
    isOpen: false,
  });
  const { mutate: _deleteClass, isPending: deletingClass } = useSupaMutation(
    deleteClass,
    {
      invalidate: [["listClasses"]],
    },
  );

  if (isLoading) {
    return <Spinner />;
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
                    footerAction={
                      <div className="flex gap-1.5">
                        <Button
                          className="h-8 w-8 rounded-full p-2"
                          variant={"secondary"}
                          onClick={() => {
                            setDialogState({
                              isOpen: true,
                              initFormValues: danceClass,
                            });
                          }}
                        >
                          <Edit width={16} />
                        </Button>
                        <Button
                          className="h-8 w-8 rounded-full p-2"
                          variant={"destructive"}
                          disabled={deletingClass}
                          onClick={() => {
                            _deleteClass(danceClass);
                          }}
                        >
                          <TrashIcon width={16} />
                        </Button>
                      </div>
                    }
                  />
                </div>
              );
            })}
          </div>

          <Button
            onClick={async () => {
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
